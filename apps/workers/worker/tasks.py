"""Celery task definitions for Strategy Builder workers."""

from __future__ import annotations

from celery import shared_task


@shared_task(name="worker.tasks.bootstrap_workspace")
def bootstrap_workspace(user_id: str) -> dict[str, str]:
    """Placeholder bootstrap task that will be expanded with actual provisioning logic."""
    return {"status": "pending", "user_id": user_id}
