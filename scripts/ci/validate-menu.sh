#!/usr/bin/env bash
# Validate Clover-synced menu-data.json before packaging.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MENU_JSON="${ROOT}/public/menu-data.json"

[[ -f "$MENU_JSON" ]] || { echo "ERROR: missing $MENU_JSON"; exit 1; }

python3 - <<'PY'
import json, sys, re
from pathlib import Path
path = Path("public/menu-data.json")
data = json.loads(path.read_text())
cats = data.get("categories") or []
if not cats:
    print("ERROR: categories empty")
    sys.exit(1)
items = 0
for c in cats:
    batch = c.get("items") or []
    if not batch:
        print(f"ERROR: category {c.get('id')} has no items")
        sys.exit(1)
    for it in batch:
        name = (it.get("name") or "").strip()
        price = (it.get("price") or "").strip()
        if not name:
            print("ERROR: item missing name")
            sys.exit(1)
        if not re.match(r"^\$\d+\.\d{2}$", price):
            print(f"ERROR: bad price for {name!r}: {price!r}")
            sys.exit(1)
        items += 1
if items < 20:
    print(f"ERROR: expected >=20 items, got {items}")
    sys.exit(1)
print(f"Menu validation: OK categories={len(cats)} items={items} updatedAt={data.get('updatedAt')}")
PY

ORDER_URL="${VITE_CLOVER_ORDERING_URL:-}"
if [[ -z "$ORDER_URL" ]]; then
  echo "ERROR: VITE_CLOVER_ORDERING_URL is empty"
  exit 1
fi
if [[ ! "$ORDER_URL" =~ ^https:// ]]; then
  echo "ERROR: ordering URL must be https"
  exit 1
fi
echo "Ordering URL: OK (https)"
