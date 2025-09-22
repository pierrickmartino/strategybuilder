"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="API health probe")
def read_health() -> dict[str, str]:
  """Return a simple status payload confirming the service is online."""
  return {"status": "ok"}
