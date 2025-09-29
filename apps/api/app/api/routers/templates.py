"""Template library endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.templates import TemplateLibraryResponse
from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import AuthenticatedUser
from app.db.session import get_db
from app.services.audit_service import record_template_visibility
from app.services.template_service import get_template_library

router = APIRouter(tags=["templates"])


@router.get("/templates", response_model=TemplateLibraryResponse)
async def list_templates(
  user: AuthenticatedUser = Depends(require_compliance_consent),
  session: AsyncSession = Depends(get_db)
) -> TemplateLibraryResponse:
  """Return curated starter templates."""
  templates = get_template_library()
  await record_template_visibility(session, user, [template["id"] for template in templates])
  return TemplateLibraryResponse(templates=templates)
