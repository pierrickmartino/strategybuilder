"""Strategy versioning and validation services."""

from __future__ import annotations

from datetime import datetime, timezone
import uuid

from typing import Any, Iterable

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.strategy import Strategy, StrategyVersion
from app.models.workspace import Workspace
from app.services.graph_validation_service import validate_graph


def _determine_plan(user: AuthenticatedUser) -> str:
  return "pro" if "pro" in user.roles else "free"


async def _fetch_strategy(
  session: AsyncSession,
  strategy_id: uuid.UUID,
  user: AuthenticatedUser
) -> Strategy:
  stmt = (
    select(Strategy)
    .join(Workspace, Strategy.workspace_id == Workspace.id)
    .where(Strategy.id == strategy_id, Workspace.user_id == uuid.UUID(user.id))
  )
  strategy = await session.scalar(stmt)
  if not strategy:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
  return strategy


async def list_versions(
  session: AsyncSession,
  strategy_id: uuid.UUID,
  user: AuthenticatedUser
) -> list[StrategyVersion]:
  strategy = await _fetch_strategy(session, strategy_id, user)
  stmt = (
    select(StrategyVersion)
    .where(StrategyVersion.strategy_id == strategy.id)
    .order_by(StrategyVersion.created_at.desc())
  )
  result = await session.execute(stmt)
  return list(result.scalars())


async def validate_version_graph(
  graph: dict[str, Any],
  user: AuthenticatedUser
) -> list[dict[str, Any]]:
  plan = _determine_plan(user)
  return validate_graph(graph, plan)


async def create_version(
  session: AsyncSession,
  strategy_id: uuid.UUID,
  graph: dict[str, Any],
  user: AuthenticatedUser,
  *,
  label: str | None = None,
  notes: str | None = None,
  educator_callouts: Iterable[dict[str, Any]] | None = None
) -> StrategyVersion:
  strategy = await _fetch_strategy(session, strategy_id, user)
  plan = _determine_plan(user)
  issues = validate_graph(graph, plan)

  result = await session.execute(
    select(func.max(StrategyVersion.version)).where(StrategyVersion.strategy_id == strategy.id)
  )
  current_max = result.scalar() or 0
  next_version = current_max + 1

  timestamp = datetime.now(timezone.utc)

  version = StrategyVersion(
    strategy=strategy,
    version=next_version,
    label=label or f"Auto Save v{next_version}",
    graph_json=graph,
    notes=notes,
    educator_callouts=list(educator_callouts or []),
    validation_issues=issues,
    created_at=timestamp,
    updated_at=timestamp
  )
  session.add(version)
  strategy.updated_at = timestamp

  await session.flush()
  return version


async def revert_to_version(
  session: AsyncSession,
  strategy_id: uuid.UUID,
  version_id: uuid.UUID,
  user: AuthenticatedUser
) -> StrategyVersion:
  strategy = await _fetch_strategy(session, strategy_id, user)
  target_stmt = (
    select(StrategyVersion)
    .where(StrategyVersion.id == version_id, StrategyVersion.strategy_id == strategy.id)
  )
  target_version = await session.scalar(target_stmt)
  if not target_version:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

  result = await session.execute(
    select(func.max(StrategyVersion.version)).where(StrategyVersion.strategy_id == strategy.id)
  )
  current_max = result.scalar() or 0
  next_version = current_max + 1

  timestamp = datetime.now(timezone.utc)
  clone_label = f"Revert to v{target_version.version}"
  version = StrategyVersion(
    strategy=strategy,
    version=next_version,
    label=clone_label,
    graph_json=target_version.graph_json,
    notes="Restored from prior version",
    educator_callouts=target_version.educator_callouts,
    validation_issues=target_version.validation_issues,
    created_at=timestamp,
    updated_at=timestamp
  )
  session.add(version)
  strategy.updated_at = timestamp

  await session.flush()
  return version
