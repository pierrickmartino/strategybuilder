"""Audit logging helpers."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.compliance_event import ComplianceEvent

logger = logging.getLogger("strategybuilder.audit")


async def record_workspace_bootstrap(
  session: AsyncSession,
  actor: AuthenticatedUser,
  payload: dict[str, object]
) -> ComplianceEvent:
  """Persist a compliance event and emit an audit log."""
  event = ComplianceEvent(
    user_id=uuid.UUID(actor.id),
    event_type="workspace.bootstrap",
    payload={
      "workspaceId": payload.get("workspace", {}).get("id"),
      "strategyId": payload.get("strategy", {}).get("id"),
      "created": payload.get("created"),
      "timestamp": datetime.utcnow().isoformat()
    }
  )
  session.add(event)

  logger.info(
    "workspace.bootstrap",
    extra={
      "user_id": actor.id,
      "workspace_id": payload.get("workspace", {}).get("id"),
      "strategy_id": payload.get("strategy", {}).get("id"),
      "created": payload.get("created")
    }
  )

  return event
