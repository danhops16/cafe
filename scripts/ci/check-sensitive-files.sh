#!/usr/bin/env bash
# Fail if build context or dist contains secrets / private files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

fail=0

check_absent() {
  local path="$1"
  if [[ -e "$path" ]]; then
    echo "ERROR: sensitive path present: $path"
    fail=1
  fi
}

check_absent "dist/.env"
check_absent "dist/.env.local"

# .env may exist locally for developers; it must never be tracked or copied into dist/image.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "ERROR: .env is tracked by git"
  fail=1
fi
if [[ -n "${GITHUB_ACTIONS:-}" && -e .env ]]; then
  echo "ERROR: .env present in CI workspace"
  fail=1
fi
if [[ -z "${GITHUB_ACTIONS:-}" && -e .env ]]; then
  echo "NOTE: local .env present (ok if mode 600 and gitignored)"
fi

# Source maps must not ship
if find dist -type f -name '*.map' 2>/dev/null | grep -q .; then
  echo "ERROR: source maps found in dist/"
  fail=1
fi

# Never ship private keys or env dumps
if find dist -type f \( -name '*.pem' -o -name '*.key' -o -name '.env*' \) 2>/dev/null | grep -q .; then
  echo "ERROR: private key or env file found in dist/"
  fail=1
fi

# Clover token must never appear in generated output (CI passes token via env)
if [[ -n "${CLOVER_API_TOKEN:-}" ]]; then
  if grep -R --fixed-strings --binary-files=without-match -l -- "$CLOVER_API_TOKEN" dist >/dev/null 2>&1; then
    echo "ERROR: CLOVER_API_TOKEN found inside dist/"
    fail=1
  fi
  if grep -R --fixed-strings --binary-files=without-match -l -- "$CLOVER_API_TOKEN" public/menu-data.json >/dev/null 2>&1; then
    echo "ERROR: CLOVER_API_TOKEN found inside public/menu-data.json"
    fail=1
  fi
fi

# Obvious secret markers in HTML/JS
if grep -R -E --binary-files=without-match -n 'CLOVER_API_TOKEN\s*=|BEGIN OPENSSH PRIVATE KEY|BEGIN PRIVATE KEY' dist >/dev/null 2>&1; then
  echo "ERROR: secret marker found in dist/"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "Sensitive file check: OK"
