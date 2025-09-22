"""Celery application configuration for Strategy Builder workers."""

from __future__ import annotations

import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "strategybuilder",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_routes={
        "worker.tasks.bootstrap_workspace": {"queue": "workspace"},
    },
    task_default_queue="default",
)


@celery_app.task(name="worker.tasks.health_check")
def health_check() -> str:
    """Return a static payload to confirm worker liveness."""
    return "ok"
