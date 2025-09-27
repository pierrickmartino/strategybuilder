"""Graph validation rules shared between autosave and explicit validation."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from app.data.block_definitions import BlockDefinition, BlockParameterDefinition, load_block_definitions


@dataclass
class ValidationIssue:
  """Structured validation issue returned to clients."""

  node_id: str | None
  code: str
  message: str
  severity: str = "error"

  def to_payload(self) -> dict[str, Any]:
    """Serialise the issue for API responses."""
    return {
      "nodeId": self.node_id,
      "code": self.code,
      "message": self.message,
      "severity": self.severity
    }


class GraphValidator:
  """Validates strategy graphs against starter block definitions and quotas."""

  def __init__(self, plan: str = "free") -> None:
    self.plan = plan
    self.definitions = load_block_definitions()

  def validate(self, graph: dict[str, Any]) -> list[ValidationIssue]:
    """Run all validation checks and return issues."""
    issues: list[ValidationIssue] = []

    nodes = graph.get("nodes", []) if isinstance(graph, dict) else []
    edges = graph.get("edges", []) if isinstance(graph, dict) else []

    node_map: dict[str, dict[str, Any]] = {}
    for node in nodes:
      node_id = node.get("id")
      if not node_id:
        issues.append(ValidationIssue(node_id=None, code="missing_id", message="Node is missing an id"))
        continue
      node_map[node_id] = node
      node_type = node.get("type")
      if node_type not in self.definitions:
        issues.append(ValidationIssue(node_id=node_id, code="unknown_block", message="Block type is not supported"))

    if not node_map:
      return issues

    adjacency = self._build_adjacency(edges, node_map)

    for node_id, node in node_map.items():
      definition = self.definitions.get(node.get("type"))
      if not definition:
        # Unknown block already recorded
        continue
      issues.extend(self._validate_required_inputs(node_id, node, definition, adjacency, node_map))
      issues.extend(self._validate_parameters(node_id, node, definition))

    issues.extend(self._validate_edges(edges, node_map))
    issues.extend(self._validate_quota(node_map))

    return issues

  def _build_adjacency(
    self,
    edges: list[dict[str, Any]],
    nodes: dict[str, dict[str, Any]]
  ) -> dict[str, list[dict[str, Any]]]:
    adjacency: dict[str, list[dict[str, Any]]] = {node_id: [] for node_id in nodes}
    for edge in edges:
      target = edge.get("target")
      source = edge.get("source")
      if target in adjacency and source in nodes:
        adjacency[target].append(edge)
    return adjacency

  def _validate_required_inputs(
    self,
    node_id: str,
    node: dict[str, Any],
    definition: BlockDefinition,
    adjacency: dict[str, list[dict[str, Any]]],
    node_map: dict[str, dict[str, Any]]
  ) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    inbound_edges = adjacency.get(node_id, [])
    for port in definition.inputs:
      if not port.required:
        continue
      if not self._has_matching_edge(port.type, inbound_edges, node_map):
        issues.append(
          ValidationIssue(
            node_id=node_id,
            code="missing_input",
            message=f"Required input '{port.label}' is not connected"
          )
        )
    return issues

  def _has_matching_edge(
    self,
    signal_type: str,
    edges: list[dict[str, Any]],
    node_map: dict[str, dict[str, Any]]
  ) -> bool:
    for edge in edges:
      source_id = edge.get("source")
      source_type = node_map.get(source_id, {}).get("type")
      source_def = self.definitions.get(source_type)
      if not source_def:
        continue
      if any(output.type == signal_type for output in source_def.outputs):
        return True
    return False

  def _validate_parameters(
    self,
    node_id: str,
    node: dict[str, Any],
    definition: BlockDefinition
  ) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    metadata = node.get("metadata") or {}
    parameters = metadata.get("parameters") or {}

    for parameter in definition.parameters:
      value = parameters.get(parameter.key, parameter.default)
      issues.extend(self._check_parameter_bounds(node_id, parameter, value))
    return issues

  def _check_parameter_bounds(
    self,
    node_id: str,
    parameter: BlockParameterDefinition,
    value: Any
  ) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    if parameter.type == "number":
      try:
        numeric_value = float(value)
      except (TypeError, ValueError):
        issues.append(
          ValidationIssue(
            node_id=node_id,
            code="invalid_parameter",
            message=f"Parameter '{parameter.label}' is not a number"
          )
        )
        return issues
      if parameter.min is not None and numeric_value < parameter.min:
        issues.append(
          ValidationIssue(
            node_id=node_id,
            code="parameter_below_min",
            message=f"{parameter.label} must be ≥ {parameter.min}"
          )
        )
      if parameter.max is not None and numeric_value > parameter.max:
        issues.append(
          ValidationIssue(
            node_id=node_id,
            code="parameter_above_max",
            message=f"{parameter.label} must be ≤ {parameter.max}"
          )
        )
    elif parameter.type == "enum":
      options = parameter.options or ()
      if options and value not in options:
        issues.append(
          ValidationIssue(
            node_id=node_id,
            code="parameter_not_allowed",
            message=f"{parameter.label} must be one of {', '.join(options)}"
          )
        )
    return issues

  def _validate_edges(
    self,
    edges: list[dict[str, Any]],
    nodes: dict[str, dict[str, Any]]
  ) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for edge in edges:
      source_id = edge.get("source")
      target_id = edge.get("target")
      if source_id not in nodes or target_id not in nodes:
        issues.append(
          ValidationIssue(
            node_id=None,
            code="dangling_edge",
            message=f"Edge {edge.get('id')} references missing nodes"
          )
        )
        continue
      source_def = self.definitions.get(nodes[source_id].get("type"))
      target_def = self.definitions.get(nodes[target_id].get("type"))
      if not source_def or not target_def:
        continue
      if not self._edge_is_compatible(source_def, target_def):
        issues.append(
          ValidationIssue(
            node_id=target_id,
            code="incompatible_connection",
            message=f"{source_def.label} cannot connect to {target_def.label}"
          )
        )
    return issues

  def _edge_is_compatible(self, source: BlockDefinition, target: BlockDefinition) -> bool:
    source_types = {port.type for port in source.outputs}
    target_types = {port.type for port in target.inputs}
    if not target_types:
      return True
    return bool(source_types.intersection(target_types))

  def _validate_quota(self, nodes: dict[str, dict[str, Any]]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    counts: dict[str, int] = {}
    for node in nodes.values():
      node_type = node.get("type")
      if node_type not in self.definitions:
        continue
      counts[node_type] = counts.get(node_type, 0) + 1

    for block_kind, count in counts.items():
      block = self.definitions[block_kind]
      limit = block.limits.get(self.plan)
      if limit is not None and count > limit:
        issues.append(
          ValidationIssue(
            node_id=None,
            code="quota_exceeded",
            message=f"{block.label} exceeds the {self.plan} plan quota ({count}/{limit})"
          )
        )
    return issues


def validate_graph(graph: dict[str, Any], plan: str) -> list[dict[str, Any]]:
  """Convenience helper that returns serialisable validation payload."""
  validator = GraphValidator(plan=plan)
  return [issue.to_payload() for issue in validator.validate(graph)]
