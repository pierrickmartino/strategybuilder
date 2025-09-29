"""Education content endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.education import EducationSuiteResponse
from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.services.audit_service import record_education_delivery
from app.services.education_service import get_onboarding_education

router = APIRouter(tags=["education"])


@router.get("/education/onboarding", response_model=EducationSuiteResponse)
async def get_onboarding_content(
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> EducationSuiteResponse:
  """Return the onboarding education hub content."""
  suite = get_onboarding_education()
  await record_education_delivery(session, user, [panel["id"] for panel in suite["panels"]])
  return EducationSuiteResponse(**suite)
