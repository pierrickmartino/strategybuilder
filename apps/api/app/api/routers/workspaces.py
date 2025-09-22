"""Workspace-related endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.services.audit_service import record_workspace_bootstrap
from app.services.workspace_service import (
  get_or_create_demo_workspace,
  workspace_response_payload
)

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("/bootstrap", status_code=status.HTTP_200_OK)
async def bootstrap_workspace(
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> dict[str, object]:
  """Create the demo workspace on first login and return the bootstrap payload."""
  workspace, strategy, version, created = await get_or_create_demo_workspace(session, user)
  payload = workspace_response_payload(workspace, strategy, version)
  payload["created"] = created
  payload["userId"] = str(workspace.user_id)

  await record_workspace_bootstrap(session, user, payload)

  return payload
