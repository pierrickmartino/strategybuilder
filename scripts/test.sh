#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required but not installed" >&2
  exit 1
fi

pnpm install --frozen-lockfile=false
poetry install --sync --no-root --directory apps/api
poetry install --sync --no-root --directory apps/workers

pnpm turbo run lint
pnpm turbo run test
