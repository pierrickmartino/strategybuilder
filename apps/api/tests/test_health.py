"""Health endpoint tests."""

from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_health_endpoint_returns_ok_status() -> None:
  response = client.get("/api/v1/health")
  assert response.status_code == 200
  assert response.json() == {"status": "ok"}
