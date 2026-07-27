#!/usr/bin/env bash
# Restricted Allstar Eateries (cafe) production deploy wrapper.
# Invoked only via forced-command SSH from GitHub Actions.
# Accepts: SSH_ORIGINAL_COMMAND = "deploy <40-hex-sha>-<run_id>"
# Reads a one-line GHCR token from stdin (never logged).
set -euo pipefail

umask 077

IMAGE_NAMESPACE="ghcr.io/danhops16/cafe"
COMPOSE_DIR="/srv/ptp/compose"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.yml"
IMAGE_ENV_FILE="${COMPOSE_DIR}/.env.cafe"
SERVICE="cafe"
CONTAINER="ptp-cafe-1"
EXPECTED_TITLE="Allstar Eateries"
INTERNAL_HOST="cafe.ptp.local"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() { log "ERROR: $*"; exit 1; }

cmd="${SSH_ORIGINAL_COMMAND:-}"
[[ -n "$cmd" ]] || die "missing SSH_ORIGINAL_COMMAND"
if [[ "$cmd" =~ ^deploy\ ([0-9a-f]{40}-[0-9]+)$ ]]; then
  RELEASE="${BASH_REMATCH[1]}"
else
  die "rejected command (expected: deploy <40-hex-sha>-<run_id>)"
fi

IMAGE_REF="${IMAGE_NAMESPACE}:${RELEASE}"

TOKEN=""
if ! IFS= read -r TOKEN; then
  die "missing GHCR token on stdin"
fi
[[ -n "$TOKEN" ]] || die "empty GHCR token on stdin"

cleanup_docker_auth() {
  if [[ -n "${DOCKER_CONFIG:-}" && -d "${DOCKER_CONFIG}" ]]; then
    docker logout ghcr.io >/dev/null 2>&1 || true
    rm -rf "${DOCKER_CONFIG}" || true
  fi
  unset TOKEN || true
}
trap cleanup_docker_auth EXIT

export DOCKER_CONFIG
DOCKER_CONFIG="$(mktemp -d /tmp/cafe-docker-config.XXXXXX)"
chmod 700 "${DOCKER_CONFIG}"
printf '%s' "${TOKEN}" | docker login ghcr.io -u danhops16 --password-stdin >/dev/null 2>&1
TOKEN=""

cd "${COMPOSE_DIR}"

compose() {
  if [[ -f "${IMAGE_ENV_FILE}" ]]; then
    docker compose --env-file "${IMAGE_ENV_FILE}" -f "${COMPOSE_FILE}" --profile apps "$@"
  else
    docker compose -f "${COMPOSE_FILE}" --profile apps "$@"
  fi
}

current_image_ref() {
  if [[ -f "${IMAGE_ENV_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${IMAGE_ENV_FILE}"
    if [[ -n "${CAFE_IMAGE:-}" ]]; then
      printf '%s\n' "${CAFE_IMAGE}"
      return
    fi
  fi
  docker inspect "${CONTAINER}" --format '{{.Config.Image}}' 2>/dev/null || printf 'ptp/cafe-website:local\n'
}

current_image_id() {
  docker inspect "${CONTAINER}" --format '{{.Image}}'
}

wait_healthy() {
  local deadline=$((SECONDS + 90))
  while (( SECONDS < deadline )); do
    local st
    st="$(docker inspect "${CONTAINER}" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || echo missing)"
    if [[ "$st" == "healthy" || "$st" == "running" ]]; then
      # Prefer healthy when healthcheck exists
      if [[ "$st" == "healthy" ]]; then
        return 0
      fi
      # running without health: still probe HTTP
      if curl -fsS --max-time 5 -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/" >/dev/null 2>&1; then
        return 0
      fi
    fi
    sleep 3
  done
  return 1
}

peer_ok() {
  local names
  names="$(docker ps --format '{{.Names}} {{.Status}}')"
  echo "$names" | grep -q 'ptp-caddy-1.*\(healthy\|Up\)' || return 1
  echo "$names" | grep -q 'ptp-liftandfix-1.*\(healthy\|Up\)' || return 1
  echo "$names" | grep -q 'ptp-construction-1.*\(healthy\|Up\)' || return 1
  return 0
}

verify_stack() {
  local label="$1"
  log "verify (${label}): docker health"
  wait_healthy || die "container not healthy (${label})"

  log "verify (${label}): internal homepage"
  local body code
  code="$(curl -sS -o /tmp/cafe-home.html -w '%{http_code}' --max-time 20 -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/" || true)"
  [[ "$code" == "200" ]] || die "homepage HTTP ${code} (${label})"
  body="$(cat /tmp/cafe-home.html)"
  echo "$body" | grep -q "${EXPECTED_TITLE}" || die "homepage title missing (${label})"
  echo "$body" | grep -qi "All Star\|Allstar" || die "brand missing (${label})"

  log "verify (${label}): menu + print-menu + assets"
  curl -fsS --max-time 20 -o /dev/null -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/menu.html" \
    || die "menu.html failed (${label})"
  curl -fsS --max-time 20 -o /dev/null -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/print-menu.html" \
    || die "print-menu.html failed (${label})"
  curl -fsS --max-time 20 -o /dev/null -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/menu-data.json" \
    || die "menu-data.json failed (${label})"
  curl -fsS --max-time 20 -o /dev/null -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/images/order-qr.png" \
    || die "order-qr.png failed (${label})"
  curl -fsS --max-time 20 -o /dev/null -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1/images/menu/jollof-rice-plate.png" \
    || die "jollof image failed (${label})"

  log "verify (${label}): menu JSON non-empty"
  python3 - <<'PY' || die "menu JSON validation failed (${label})"
import json,sys,urllib.request
req=urllib.request.Request("http://127.0.0.1/menu-data.json", headers={"Host":"cafe.ptp.local"})
data=json.load(urllib.request.urlopen(req, timeout=20))
cats=data.get("categories") or []
assert cats, "no categories"
items=sum(len(c.get("items") or []) for c in cats)
assert items >= 20, items
print(f"menu_ok categories={len(cats)} items={items}")
PY

  log "verify (${label}): no private files exposed"
  for path in "/.env" "/.git/config" "/package.json" "/Dockerfile"; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 -H "Host: ${INTERNAL_HOST}" "http://127.0.0.1${path}" || true)"
    [[ "$code" == "404" || "$code" == "403" ]] || die "path ${path} exposed HTTP ${code} (${label})"
  done

  log "verify (${label}): peer containers"
  peer_ok || die "peer container health regression (${label})"
}

rollback() {
  local prev_ref="$1"
  log "ROLLBACK: restoring image ${prev_ref}"
  umask 077
  printf 'CAFE_IMAGE=%s\n' "${prev_ref}" > "${IMAGE_ENV_FILE}.tmp"
  mv -f "${IMAGE_ENV_FILE}.tmp" "${IMAGE_ENV_FILE}"
  set -a
  # shellcheck disable=SC1090
  source "${IMAGE_ENV_FILE}"
  set +a
  export CAFE_IMAGE="${prev_ref}"
  compose up -d --no-deps --force-recreate "${SERVICE}"
  verify_stack "rollback" || die "rollback verification failed — manual intervention required"
  log "ROLLBACK: complete; previous image restored"
}

log "deploy start release=${RELEASE} image=${IMAGE_REF}"
[[ -f "${COMPOSE_FILE}" ]] || die "missing compose file"

docker inspect "${CONTAINER}" --format '{{.State.Status}}' 2>/dev/null | grep -qiE 'running|healthy' \
  || die "current cafe container not up; refusing deploy"

PREV_REF="$(current_image_ref)"
PREV_ID="$(current_image_id)"
log "current image ref=${PREV_REF} id=${PREV_ID}"

ROLLBACK_TAG="ptp/cafe-website:rollback-$(date -u +%Y%m%dT%H%M%SZ)"
docker tag "${PREV_ID}" "${ROLLBACK_TAG}" || true
log "retained rollback tag ${ROLLBACK_TAG}"

log "pulling ${IMAGE_REF}"
docker pull "${IMAGE_REF}"
DIGEST="$(docker inspect --format '{{index .RepoDigests 0}}' "${IMAGE_REF}" 2>/dev/null || true)"
IMAGE_ID="$(docker inspect --format '{{.Id}}' "${IMAGE_REF}")"
log "pulled digest=${DIGEST:-unknown} id=${IMAGE_ID}"

cleanup_docker_auth
trap - EXIT

umask 077
printf 'CAFE_IMAGE=%s\n' "${IMAGE_REF}" > "${IMAGE_ENV_FILE}.tmp"
mv -f "${IMAGE_ENV_FILE}.tmp" "${IMAGE_ENV_FILE}"
set -a
# shellcheck disable=SC1090
source "${IMAGE_ENV_FILE}"
set +a
export CAFE_IMAGE="${IMAGE_REF}"

log "recreating service ${SERVICE} only"
if ! compose up -d --no-deps --pull never --force-recreate "${SERVICE}"; then
  log "compose up failed — rolling back"
  rollback "${PREV_REF}"
  die "deploy failed during compose up; rolled back to ${PREV_REF}"
fi

if ! verify_stack "post-deploy"; then
  rollback "${PREV_REF}"
  die "post-deploy verification failed; rolled back to ${PREV_REF}"
fi

log "DEPLOY OK release=${RELEASE} image=${IMAGE_REF} digest=${DIGEST:-unknown}"
log "previous ref=${PREV_REF} rollback_tag=${ROLLBACK_TAG}"
