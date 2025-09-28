"""Block metadata shared between frontend and backend."""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import json
from pathlib import Path
from typing import Any

PACKAGE_RELATIVE_BLOCKS_PATH = Path("packages/shared/src/data/block-definitions.json")


def _repository_root() -> Path:
  return Path(__file__).resolve().parents[4]


@dataclass(frozen=True)
class BlockPortDefinition:
  """Port definition describing inputs and outputs."""

  id: str
  label: str
  type: str
  required: bool = False


@dataclass(frozen=True)
class BlockParameterDefinition:
  """Parameter metadata exposed in the configuration side panel."""

  key: str
  label: str
  type: str
  default: Any
  min: float | None = None
  max: float | None = None
  step: float | None = None
  options: tuple[str, ...] | None = None
  hint: str | None = None


@dataclass(frozen=True)
class BlockDefinition:
  """Starter block definition."""

  kind: str
  label: str
  category: str
  description: str
  inputs: tuple[BlockPortDefinition, ...]
  outputs: tuple[BlockPortDefinition, ...]
  parameters: tuple[BlockParameterDefinition, ...]
  limits: dict[str, int]


@lru_cache(maxsize=1)
def load_block_definitions() -> dict[str, BlockDefinition]:
  """Load block definitions from the shared JSON contract."""
  payload_path = _repository_root() / PACKAGE_RELATIVE_BLOCKS_PATH
  if not payload_path.exists():
    raise FileNotFoundError(f"Block definitions file not found: {payload_path}")

  with payload_path.open(encoding="utf-8") as handle:
    data = json.load(handle)

  definitions: dict[str, BlockDefinition] = {}
  for raw in data.get("blocks", []):
    inputs = tuple(
      BlockPortDefinition(
        id=port["id"],
        label=port["label"],
        type=port["type"],
        required=port.get("required", False)
      )
      for port in raw["ports"].get("inputs", [])
    )
    outputs = tuple(
      BlockPortDefinition(
        id=port["id"],
        label=port["label"],
        type=port["type"],
        required=port.get("required", False)
      )
      for port in raw["ports"].get("outputs", [])
    )
    parameters = tuple(
      BlockParameterDefinition(
        key=param["key"],
        label=param["label"],
        type=param["type"],
        default=param["default"],
        min=param.get("min"),
        max=param.get("max"),
        step=param.get("step"),
        options=tuple(param.get("options", [])) if param.get("options") else None,
        hint=param.get("hint")
      )
      for param in raw.get("parameters", [])
    )
    limits = raw.get("limits", {})
    definitions[raw["kind"]] = BlockDefinition(
      kind=raw["kind"],
      label=raw["label"],
      category=raw.get("category", ""),
      description=raw.get("description", ""),
      inputs=inputs,
      outputs=outputs,
      parameters=parameters,
      limits=limits
    )

  return definitions


@lru_cache(maxsize=1)
def get_signal_types() -> tuple[str, ...]:
  """Return the ordered tuple of supported signal types."""
  payload_path = _repository_root() / PACKAGE_RELATIVE_BLOCKS_PATH
  with payload_path.open(encoding="utf-8") as handle:
    data = json.load(handle)
  return tuple(data.get("signalTypes", []))
