"""Workspace provisioning service."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.strategy import Strategy, StrategyVersion
from app.models.workspace import Workspace

DEMO_STRATEGY_NAME = "Momentum Playground"
DEMO_STRATEGY_DESCRIPTION = "Sample graph that showcases entry, risk, and analytics blocks."
DEMO_TEMPLATE_ID = "demo-onboarding"

DEMO_GRAPH = {
  "nodes": [
    {
      "id": "market-data",
      "label": "Market Data",
      "type": "source",
      "metadata": {"description": "Streams OHLCV candles via Supabase realtime."}
    },
    {
      "id": "trend-filter",
      "label": "Trend Filter",
      "type": "indicator",
      "metadata": {"description": "EMA crossover to confirm momentum."}
    },
    {
      "id": "risk-controls",
      "label": "Risk Controls",
      "type": "risk",
      "metadata": {"description": "Fixed 1% capital per trade with 2R stop."}
    },
    {
      "id": "paper-broker",
      "label": "Paper Broker",
      "type": "execution",
      "metadata": {"description": "Routes simulated orders to the paper trading engine."}
    }
  ],
  "edges": [
    {"id": "edge-1", "source": "market-data", "target": "trend-filter"},
    {"id": "edge-2", "source": "trend-filter", "target": "risk-controls"},
    {"id": "edge-3", "source": "risk-controls", "target": "paper-broker"}
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

  version = StrategyVersion(
    strategy=strategy,
    version_name="v1",
    graph=DEMO_GRAPH,
    educator_callouts=DEMO_CALLOUTS
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
      "versionName": version.version_name,
      "graph": version.graph,
      "educatorCallouts": version.educator_callouts,
      "createdAt": version.created_at.isoformat() if version.created_at else None
    }
  }
