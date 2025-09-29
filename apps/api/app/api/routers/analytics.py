"""Analytics ingestion endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.analytics import OnboardingEventRequest
from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.services.analytics_service import record_onboarding_events

router = APIRouter(tags=["analytics"])


@router.post("/analytics/onboarding", status_code=status.HTTP_202_ACCEPTED)
async def ingest_onboarding_events(
  payload: OnboardingEventRequest,
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> dict[str, int]:
  """Persist onboarding analytics events emitted by the client."""
  await record_onboarding_events(session, user, payload.events)
  return {"received": len(payload.events)}
