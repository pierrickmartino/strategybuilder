"""Pydantic schemas for strategy version endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class CanvasValidationIssue(BaseModel):
  """Validation issue payload returned to the frontend."""

  nodeId: str | None = None
  code: str
  message: str
  severity: str = "error"


class StrategyVersionSummary(BaseModel):
  """Summary of a stored version."""

  id: UUID
  version: int
  label: str
  graph: dict[str, Any]
  validationIssues: list[CanvasValidationIssue]
  createdAt: datetime
  updatedAt: datetime | None = None

  class Config:
    populate_by_name = True


class StrategyVersionListResponse(BaseModel):
  """Response containing recent versions."""

  versions: list[StrategyVersionSummary]


class StrategyVersionCreateRequest(BaseModel):
  """Autosave payload from the canvas."""

  graph: dict[str, Any]
  label: str | None = None
  notes: str | None = None
  educatorCallouts: list[dict[str, Any]] | None = None


class StrategyVersionCreateResponse(BaseModel):
  """Response returned after persisting a version."""

  version: StrategyVersionSummary


class StrategyVersionValidateRequest(BaseModel):
  """Payload for validation requests."""

  graph: dict[str, Any]


class StrategyVersionValidateResponse(BaseModel):
  """Validation issues returned to the client."""

  issues: list[CanvasValidationIssue]
