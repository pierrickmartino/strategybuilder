#!/usr/bin/env bash
set -euo pipefail

# Run backend unit tests
if [ -d "backend" ]; then
  pushd backend > /dev/null
  python -m unittest discover -s tests -p "test_*.py"
  popd > /dev/null
else
  echo "Backend directory not found" >&2
  exit 1
fi
