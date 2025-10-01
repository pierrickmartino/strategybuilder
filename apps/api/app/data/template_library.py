"""Static template library content used by the onboarding flow."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable


@lru_cache(maxsize=1)
def _load_block_index() -> dict[str, dict[str, Any]]:
  root = Path(__file__).resolve().parents[4]
  raw = (root / "packages" / "shared" / "src" / "data" / "block-definitions.json").read_text(encoding="utf-8")
  payload = json.loads(raw)
  return {entry["kind"]: entry for entry in payload.get("blocks", [])}


def _block(kind: str, summary: str, tooltip: str) -> dict[str, str]:
  block_defs = _load_block_index()
  definition = block_defs.get(kind, {})
  title = definition.get("label", kind.replace("-", " ").title())
  return {
    "id": kind,
    "title": title,
    "summary": summary,
    "tooltip": tooltip or definition.get("description", "")
  }


def list_templates() -> list[dict[str, Any]]:
  """Return the curated template library."""

  templates: Iterable[dict[str, Any]] = [
    {
      "id": "3c9703d6-f7c6-4921-bac5-8487b7dd5c58",
      "strategyVersionId": "5c1a21da-fda6-4dfd-b1d3-2785ac4d6b53",
      "educatorId": "a27bf631-9d8d-4fbe-b5f1-44b9d4580b91",
      "audienceScope": "public",
      "cloneCount": 1242,
      "createdAt": "2024-09-01T18:32:00Z",
      "metadata": {
        "slug": "trend-following-starter",
        "title": "Trend following starter",
        "description": "Ride medium-term trends using EMA crossover momentum and risk controls.",
        "audience": "beginner",
        "estimatedBacktestMinutes": 4,
        "blocks": [
          _block(
            "market-data",
            "Bitcoin hourly candles",
            "Streams OHLCV data to seed downstream indicators."
          ),
          _block(
            "momentum-indicator",
            "12/26 EMA crossover",
            "Calculates fast/slow EMA crossover to detect emerging trends."
          ),
          _block(
            "signal-router",
            "Confirms momentum strength",
            "Routes high-confidence trend signals to the risk engine."
          ),
          _block(
            "risk-controls",
            "1% risk, ATR-based stops",
            "Applies position sizing and dynamic stop losses for survivors."
          ),
          _block(
            "paper-broker",
            "Simulated execution",
            "Sends intents to the paper trading broker so no live orders fire."
          )
        ],
        "disclaimers": [
          "Simulated results do not represent live trading performance.",
          "Capital at risk is capped because positions rebalance using paper broker routes.",
          "Avoid running on illiquid assets without validating fill assumptions."
        ],
        "tags": ["trend", "momentum", "risk-managed"]
      }
    },
    {
      "id": "9d62d3e5-8ef5-4bcd-a259-6f02a4bf0d9f",
      "strategyVersionId": "c970fe18-5183-4628-92f5-3132b2d2b970",
      "educatorId": "f19d4d05-bc24-4d90-8cf2-ffbd514ae8de",
      "audienceScope": "public",
      "cloneCount": 842,
      "createdAt": "2024-08-11T10:12:00Z",
      "metadata": {
        "slug": "mean-reversion-guardrails",
        "title": "Mean reversion guardrails",
        "description": "Fade overextended moves with volatility filters and strict risk caps.",
        "audience": "intermediate",
        "estimatedBacktestMinutes": 6,
        "blocks": [
          _block(
            "market-data",
            "ETH 5m feed",
            "Provides the short interval data necessary for mean reversion setups."
          ),
          _block(
            "volatility-indicator",
            "ATR regime filter",
            "Suppresses trades when markets are excessively noisy."
          ),
          _block(
            "mean-reversion-indicator",
            "RSI 14 lookback",
            "Creates entry signals when price deviates from equilibrium."
          ),
          _block(
            "risk-controls",
            "Tighter stop placement",
            "Uses compressed stops with 0.75% max account risk per trade."
          ),
          _block(
            "paper-broker",
            "Logging-only execution",
            "Ensures fills stay in the simulation ledger with trade-by-trade logs."
          )
        ],
        "disclaimers": [
          "Do not deploy to live markets without additional slippage modelling.",
          "Short timeframe signals are sensitive to latency and spreads.",
          "Paper trading fills assume mid-market liquidity only."
        ],
        "tags": ["mean-reversion", "volatility", "short-term"]
      }
    },
    {
      "id": "be63a8ab-83a7-4dd5-8c2f-2f9b55de24c6",
      "strategyVersionId": "ea2fb6f2-5ada-4476-8f0d-f8a13dcb53f2",
      "educatorId": "b3b8c4c1-2e38-447d-8d7f-02fbcb9db0d2",
      "audienceScope": "public",
      "cloneCount": 657,
      "createdAt": "2024-07-02T14:45:00Z",
      "metadata": {
        "slug": "breakout-with-trailing-protect",
        "title": "Breakout with trailing protect",
        "description": "Capture breakouts with volatility confirmation and trailing exits.",
        "audience": "advanced",
        "estimatedBacktestMinutes": 8,
        "blocks": [
          _block(
            "market-data",
            "Multi-asset hourly feed",
            "Supports BTC, ETH, and SOL for diversified breakout scanning."
          ),
          _block(
            "volatility-indicator",
            "Bollinger bandwidth",
            "Requires volatility contraction before breakout triggers."
          ),
          _block(
            "momentum-indicator",
            "MACD confirmation",
            "Confirms breakout with MACD signal-line cross."
          ),
          _block(
            "signal-router",
            "Routes qualified breakouts",
            "Ensures only high conviction signals reach execution."
          ),
          _block(
            "risk-controls",
            "Trailing stop exits",
            "Implements ATR-based trailing stops to protect gains."
          ),
          _block(
            "paper-broker",
            "Simulation broker",
            "Records fills in the simulated ledger with timestamps."
          )
        ],
        "disclaimers": [
          "Breakout strategies can whipsaw in sideways markets.",
          "Backtests include exchange fees but exclude funding costs.",
          "Trailing stops may gap on illiquid assets."
        ],
        "tags": ["breakout", "momentum", "multi-asset"]
      }
    }
  ]

  return [dict(template) for template in templates]
