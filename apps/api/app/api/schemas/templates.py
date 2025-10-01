"""Template library schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class TemplateMetadataBlock(BaseModel):
  id: str
  title: str
  summary: str
  tooltip: str


class TemplateMetadata(BaseModel):
  slug: str
  title: str
  description: str
  audience: Literal["beginner", "intermediate", "advanced"]
  estimatedBacktestMinutes: int
  blocks: list[TemplateMetadataBlock]
  disclaimers: list[str]
  tags: list[str]


class TemplateShareOut(BaseModel):
  id: str
  strategyVersionId: str
  educatorId: str
  audienceScope: Literal["cohort", "public"]
  cloneCount: int
  createdAt: datetime
  metadata: TemplateMetadata


class TemplateLibraryResponse(BaseModel):
  templates: list[TemplateShareOut]
