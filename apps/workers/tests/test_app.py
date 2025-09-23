"""Unit tests for the Celery worker application configuration."""

from __future__ import annotations

import importlib
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from celery import Celery

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


@pytest.fixture(autouse=True)
def reload_worker_app(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Reload ``worker.app`` with a deterministic Redis URL."""
    monkeypatch.setenv("REDIS_URL", "redis://example.com:1234/9")
    sys.modules.pop("worker.app", None)
    yield
    monkeypatch.delenv("REDIS_URL", raising=False)


@pytest.fixture
def celery_app() -> Celery:
    """Return a freshly imported Celery application instance."""
    from worker import app as worker_app

    importlib.reload(worker_app)
    return worker_app.celery_app


def test_celery_app_has_expected_configuration(celery_app: Celery) -> None:
    """The Celery application should be configured with the proper queues."""
    assert celery_app.main == "strategybuilder"
    assert celery_app.conf.broker_url == "redis://example.com:1234/9"
    assert celery_app.conf.result_backend == "redis://example.com:1234/9"
    assert celery_app.conf.task_default_queue == "default"
    assert celery_app.conf.task_routes["worker.tasks.bootstrap_workspace"]["queue"] == "workspace"



def test_health_check_returns_ok() -> None:
    """The health check task should return the expected payload."""
    from worker.app import health_check

    assert health_check.run() == "ok"



def test_bootstrap_workspace_returns_pending_status() -> None:
    """The workspace bootstrap task should echo the provided user identifier."""
    from worker.tasks import bootstrap_workspace

    result = bootstrap_workspace.run("user-123")

    assert result == {"status": "pending", "user_id": "user-123"}
