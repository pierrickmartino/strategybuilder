"""Workspace-related endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.services.workspace_service import bootstrap_workspace_payload

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("/bootstrap", status_code=status.HTTP_200_OK)
async def bootstrap_workspace(
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> dict[str, object]:
  """Create the demo workspace on first login and return the bootstrap payload."""
  payload, _ = await bootstrap_workspace_payload(session, user)

  return payload
