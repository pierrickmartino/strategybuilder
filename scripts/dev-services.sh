#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/../docker-compose.yml"
COMPOSE_CMD="docker compose"

log() {
  echo "[dev-services] $1"
}

if [[ "${SKIP_DEV_SERVICES:-0}" == "1" ]]; then
  log "SKIP_DEV_SERVICES=1 detected; assuming Postgres/Redis are managed externally."
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  log "Docker not detected; skipping automatic Postgres/Redis startup. Ensure services run at DATABASE_URL=${DATABASE_URL:-postgresql+asyncpg://blockbuilders:password@localhost:5432/blockbuilders}."
  exit 0
fi

if ! ${COMPOSE_CMD} version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
  else
    log "docker compose plugin not available; install Docker Desktop or start Postgres/Redis manually."
    exit 0
  fi
fi

log "Booting local infrastructure with ${COMPOSE_CMD}"
if ! ${COMPOSE_CMD} -f "${COMPOSE_FILE}" up -d postgres redis >/dev/null 2>&1; then
  log "Unable to start dockerised services. If you already run Postgres/Redis locally, export SKIP_DEV_SERVICES=1 to bypass this helper."
  exit 0
fi

log "Waiting for Postgres to accept connections..."
attempt=0
max_attempts=${DEV_POSTGRES_ATTEMPTS:-30}
until ${COMPOSE_CMD} -f "${COMPOSE_FILE}" exec -T postgres pg_isready -U blockbuilders >/dev/null 2>&1; do
  sleep 1
  attempt=$((attempt + 1))
  if (( attempt >= max_attempts )); then
    log "Timed out waiting for Postgres to report ready; continuing anyway."
    exit 0
  fi
  log "Postgres not ready yet; retrying (${attempt}/${max_attempts})"
done

log "Postgres is ready."
