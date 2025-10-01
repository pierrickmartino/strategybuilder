"""Curated education content for the onboarding hub."""

from __future__ import annotations

from datetime import datetime
from typing import Any


def get_onboarding_suite() -> dict[str, Any]:
  """Return the education suite content."""

  updated_at = datetime(2024, 9, 30, 0, 0, 0).isoformat() + "Z"

  return {
    "updatedAt": updated_at,
    "panels": [
      {
        "id": "simulation-scope",
        "title": "Simulation scope",
        "summary": "All strategies run in a sandboxed environment with no live capital at risk.",
        "body": (
          "Your workspace replays historical market data and routes orders to the paper broker. "
          "Performance charts help you evaluate ideas before requesting compliance to go live."
        ),
        "complianceTag": "Compliance Reviewed",
        "media": [
          {
            "id": "video-simulation",
            "type": "video",
            "title": "Tour the simulation workspace",
            "url": "https://cdn.strategybuilder.dev/education/simulation-tour.mp4",
            "durationSeconds": 180
          }
        ]
      },
      {
        "id": "risk-disclosures",
        "title": "Risk disclosures",
        "summary": "Backtests use curated liquidity assumptions and cannot predict future drawdowns.",
        "body": (
          "Review the disclosure checklist before sharing strategies externally. "
          "Compliance logs every template publish so we maintain an audit trail for educators."
        ),
        "complianceTag": "Disclosure Required",
        "media": [
          {
            "id": "article-risk",
            "type": "article",
            "title": "Simulation risk FAQ",
            "url": "https://docs.strategybuilder.dev/onboarding/risk-disclosures"
          }
        ]
      },
      {
        "id": "next-steps",
        "title": "After your first backtest",
        "summary": "Validate signals, share with teammates, then request compliance approval.",
        "body": (
          "Use the activation dashboard to confirm each onboarding step emitted analytics events. "
          "When you are ready to upgrade, submit the compliance review so the audit team can approve live trading."
        ),
        "complianceTag": "Activation KPI",
        "media": [
          {
            "id": "tooltip-analytics",
            "type": "tooltip",
            "title": "Activation metrics overview",
            "url": "https://docs.strategybuilder.dev/operations/activation-dashboard"
          }
        ]
      }
    ]
  }
