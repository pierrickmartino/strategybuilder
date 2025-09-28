"""Strategy version endpoints for autosave, validation, and history."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.strategy_versions import (
  StrategyVersionCreateRequest,
  StrategyVersionCreateResponse,
  StrategyVersionListResponse,
  StrategyVersionSummary,
  StrategyVersionValidateRequest,
  StrategyVersionValidateResponse
)
from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.models.strategy import StrategyVersion
from app.services import strategy_version_service

router = APIRouter(prefix="/strategies/{strategy_id}/versions", tags=["Strategy Versions"])


def _to_summary(model: StrategyVersion) -> StrategyVersionSummary:
  return StrategyVersionSummary(
    id=model.id,
    version=model.version,
    label=model.label,
    graph=model.graph_json,
    validationIssues=list(model.validation_issues or []),
    createdAt=model.created_at,
    updatedAt=model.updated_at
  )


@router.get("", response_model=StrategyVersionListResponse)
async def list_strategy_versions(
  strategy_id: UUID,
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> StrategyVersionListResponse:
  """Return the version history for the requested strategy."""
  versions = await strategy_version_service.list_versions(session, strategy_id, user)
  return StrategyVersionListResponse(versions=[_to_summary(version) for version in versions])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=StrategyVersionCreateResponse)
async def create_strategy_version(
  strategy_id: UUID,
  payload: StrategyVersionCreateRequest,
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> StrategyVersionCreateResponse:
  """Persist a new strategy version and return the stored payload."""
  version = await strategy_version_service.create_version(
    session,
    strategy_id,
    graph=payload.graph,
    user=user,
    label=payload.label,
    notes=payload.notes,
    educator_callouts=payload.educatorCallouts or []
  )
  return StrategyVersionCreateResponse(version=_to_summary(version))


@router.post("/validate", response_model=StrategyVersionValidateResponse)
async def validate_strategy_graph(
  strategy_id: UUID,  # pylint: disable=unused-argument
  payload: StrategyVersionValidateRequest,
  user: AuthenticatedUser = Depends(require_compliance_consent)
) -> StrategyVersionValidateResponse:
  """Validate the provided graph without persisting a new version."""
  issues = await strategy_version_service.validate_version_graph(payload.graph, user)
  return StrategyVersionValidateResponse(issues=issues)


@router.post("/{version_id}/revert", status_code=status.HTTP_201_CREATED, response_model=StrategyVersionCreateResponse)
async def revert_strategy_version(
  strategy_id: UUID,
  version_id: UUID,
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> StrategyVersionCreateResponse:
  """Clone a previous version and mark it as the latest revision."""
  version = await strategy_version_service.revert_to_version(session, strategy_id, version_id, user)
  return StrategyVersionCreateResponse(version=_to_summary(version))
