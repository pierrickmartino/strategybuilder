"""Workspace provisioning service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from time import perf_counter

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.strategy import Strategy, StrategyVersion
from app.models.workspace import Workspace
from app.services.audit_service import record_workspace_bootstrap

DEMO_STRATEGY_NAME = "Momentum Playground"
DEMO_STRATEGY_DESCRIPTION = "Sample graph that showcases entry, risk, and analytics blocks."
DEMO_TEMPLATE_ID = "demo-onboarding"

DEMO_GRAPH = {
  "nodes": [
    {
      "id": "market-data",
      "label": "Market Data Feed",
      "type": "market-data",
      "metadata": {
        "parameters": {"symbol": "BTC-USD", "granularity": "5m"},
        "description": "Streams OHLCV candles via Supabase realtime."
      }
    },
    {
      "id": "momentum-indicator",
      "label": "Momentum Indicator",
      "type": "momentum-indicator",
      "metadata": {
        "parameters": {"fastLength": 12, "slowLength": 26},
        "description": "EMA crossover to confirm momentum."
      }
    },
    {
      "id": "entry-condition",
      "label": "Entry Condition",
      "type": "entry-condition",
      "metadata": {
        "parameters": {"threshold": 0.5, "volatilityFloor": 0.2},
        "description": "Generates trade signals when trend conditions align."
      }
    },
    {
      "id": "risk-controls",
      "label": "Risk Controls",
      "type": "risk-controls",
      "metadata": {
        "parameters": {"maxRiskPerTrade": 1, "stopMultiple": 2},
        "description": "Applies position sizing and stop logic."
      }
    },
    {
      "id": "paper-broker",
      "label": "Paper Broker",
      "type": "paper-broker",
      "metadata": {
        "parameters": {"venue": "paper-trading"},
        "description": "Routes simulated orders to the paper trading engine."
      }
    }
  ],
  "edges": [
    {"id": "edge-1", "source": "market-data", "target": "momentum-indicator"},
    {"id": "edge-2", "source": "momentum-indicator", "target": "entry-condition"},
    {"id": "edge-3", "source": "entry-condition", "target": "risk-controls"},
    {"id": "edge-4", "source": "risk-controls", "target": "paper-broker"}
  ]
}

DEMO_CALLOUTS = [
  {
    "id": "callout-consent",
    "title": "Simulation Only",
    "body": "All live trades are simulated until you upgrade and pass compliance reviews.",
    "placement": "top"
  },
  {
    "id": "callout-backtest",
    "title": "Backtest in seconds",
    "body": "Kick off a backtest from the toolbar to see how this strategy performs historically.",
    "placement": "left"
  }
]

LATENCY_BUDGET_MS = 150

performance_logger = logging.getLogger("strategybuilder.performance")


async def get_or_create_demo_workspace(
  session: AsyncSession, actor: AuthenticatedUser
) -> tuple[Workspace, Strategy, StrategyVersion, bool]:
  """Ensure the demo workspace exists for the authenticated user."""
  user_id = uuid.UUID(actor.id)

  result = await session.execute(select(Workspace).where(Workspace.user_id == user_id))
  workspace = result.scalar_one_or_none()

  if workspace:
    strategy_result = await session.execute(
      select(Strategy)
      .where(Strategy.workspace_id == workspace.id)
      .order_by(Strategy.created_at)
    )
    strategy = strategy_result.scalars().first()
    if not strategy:
      raise RuntimeError("Workspace exists without a strategy")

    version_result = await session.execute(
      select(StrategyVersion)
      .where(StrategyVersion.strategy_id == strategy.id)
      .order_by(StrategyVersion.created_at)
    )
    version = version_result.scalars().first()
    if not version:
      raise RuntimeError("Strategy exists without a version")

    return workspace, strategy, version, False

  workspace = Workspace(user_id=user_id, name="Demo Workspace", template_id=DEMO_TEMPLATE_ID)
  session.add(workspace)

  strategy = Strategy(
    workspace=workspace,
    name=DEMO_STRATEGY_NAME,
    description=DEMO_STRATEGY_DESCRIPTION
  )
  session.add(strategy)

  timestamp = datetime.now(timezone.utc)
  version = StrategyVersion(
    strategy=strategy,
    version=1,
    label="Initial Seed",
    graph_json=DEMO_GRAPH,
    educator_callouts=DEMO_CALLOUTS,
    validation_issues=[],
    created_at=timestamp,
    updated_at=timestamp
  )
  session.add(version)

  await session.flush()

  return workspace, strategy, version, True


def workspace_response_payload(
  workspace: Workspace, strategy: Strategy, version: StrategyVersion
) -> dict[str, object]:
  """Structure the bootstrap response payload."""
  return {
    "workspace": {
      "id": str(workspace.id),
      "name": workspace.name,
      "templateId": workspace.template_id,
      "createdAt": workspace.created_at.isoformat() if workspace.created_at else None
    },
    "strategy": {
      "id": str(strategy.id),
      "name": strategy.name,
      "description": strategy.description,
      "createdAt": strategy.created_at.isoformat() if strategy.created_at else None
    },
    "version": {
      "id": str(version.id),
      "version": version.version,
      "label": version.label,
      "graph": version.graph_json,
      "educatorCallouts": version.educator_callouts,
      "validationIssues": version.validation_issues,
      "createdAt": version.created_at.isoformat() if version.created_at else None,
      "updatedAt": version.updated_at.isoformat() if version.updated_at else None
    }
  }


async def bootstrap_workspace_payload(
  session: AsyncSession, actor: AuthenticatedUser
) -> tuple[dict[str, object], float]:
  """Provision the workspace payload and emit latency telemetry."""
  start = perf_counter()
  workspace, strategy, version, created = await get_or_create_demo_workspace(session, actor)

  payload = workspace_response_payload(workspace, strategy, version)
  payload["created"] = created
  payload["userId"] = str(workspace.user_id)

  await record_workspace_bootstrap(session, actor, payload)

  duration_ms = (perf_counter() - start) * 1000
  performance_logger.info(
    "workspaces.bootstrap.latency",
    extra={
      "duration_ms": duration_ms,
      "latency_budget_ms": LATENCY_BUDGET_MS,
      "workspace_created": created,
      "user_id": actor.id
    }
  )

  return payload, duration_ms
