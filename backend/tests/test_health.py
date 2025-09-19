"""Unit tests for the FastAPI health endpoint."""

import unittest

from app.main import create_app


class HealthEndpointTests(unittest.TestCase):
    """Verify the health endpoint is registered correctly."""

    def setUp(self) -> None:  # noqa: D401 - unittest signature
        """Create a fresh FastAPI application for each test."""
        self.app = create_app()

    def test_health_route_registered(self) -> None:
        """The application exposes a GET /health route returning a status payload."""
        routes_by_path = {route.path: route for route in self.app.routes}

        self.assertIn("/health", routes_by_path)

        health_route = routes_by_path["/health"]
        self.assertEqual({"GET"}, health_route.methods)
        self.assertEqual({"status": "ok"}, health_route.endpoint())


if __name__ == "__main__":  # pragma: no cover - convenience for direct execution
    unittest.main()
