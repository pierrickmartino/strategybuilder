"""Education content schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class EducationMediaAsset(BaseModel):
  id: str
  type: Literal["video", "article", "tooltip"]
  title: str
  url: str
  durationSeconds: int | None = None


class EducationPanel(BaseModel):
  id: str
  title: str
  summary: str
  body: str
  complianceTag: str
  media: list[EducationMediaAsset] | None = None


class EducationSuiteResponse(BaseModel):
  updatedAt: str
  panels: list[EducationPanel]
