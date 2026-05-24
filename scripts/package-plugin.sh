#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/dist/architect-lint-plugin.zip"
mkdir -p "${ROOT}/dist"
rm -f "$OUT"
cd "$ROOT"
zip -r "$OUT" \
  catalog/ \
  registry/ \
  skills/ \
  commands/ \
  .architect-lint.yaml \
  .cursor-plugin/ \
  .claude-plugin/ \
  -x "*.DS_Store"
echo "Created $OUT"
