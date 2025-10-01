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
      "workspaceCreatedAt": payload.get("workspace", {}).get("createdAt"),
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
      "workspace_created": payload.get("created"),
      "workspace_created_at": payload.get("workspace", {}).get("createdAt")
    }
  )

  return event


async def record_template_visibility(
  session: AsyncSession,
  actor: AuthenticatedUser,
  template_ids: list[str]
) -> ComplianceEvent:
  """Log when curated templates are surfaced to a user."""

  event = ComplianceEvent(
    user_id=uuid.UUID(actor.id),
    event_type="template.visibility",
    payload={
      "templateIds": template_ids,
      "count": len(template_ids),
      "timestamp": datetime.utcnow().isoformat()
    }
  )
  session.add(event)

  logger.info(
    "template.visibility",
    extra={"user_id": actor.id, "template_ids": template_ids, "count": len(template_ids)}
  )

  return event


async def record_education_delivery(
  session: AsyncSession,
  actor: AuthenticatedUser,
  panel_ids: list[str]
) -> ComplianceEvent:
  """Log when compliance education panels are returned."""

  event = ComplianceEvent(
    user_id=uuid.UUID(actor.id),
    event_type="education.delivery",
    payload={
      "panelIds": panel_ids,
      "count": len(panel_ids),
      "timestamp": datetime.utcnow().isoformat()
    }
  )
  session.add(event)

  logger.info(
    "education.delivery",
    extra={"user_id": actor.id, "panel_ids": panel_ids, "count": len(panel_ids)}
  )

  return event
