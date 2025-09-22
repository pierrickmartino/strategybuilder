"""Strategy Builder FastAPI application factory."""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, health, workspaces
from app.db.base import Base
from app.db.session import get_engine

# Ensure models are imported for metadata generation
from app import models as _  # noqa: F401  # pylint: disable=unused-import

API_PREFIX = "/api/v1"

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s - %(message)s")


@asynccontextmanager
async def lifespan(_app: FastAPI):
  """Application lifespan that initialises database schema."""
  engine = get_engine()
  async with engine.begin() as connection:
    await connection.run_sync(Base.metadata.create_all)
  yield


def create_app() -> FastAPI:
  """Create and configure a FastAPI application instance."""
  app = FastAPI(title="Strategy Builder API", version="0.1.0", lifespan=lifespan)

  app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
  )

  app.include_router(health.router, prefix=API_PREFIX)
  app.include_router(auth.router, prefix=API_PREFIX)
  app.include_router(workspaces.router, prefix=API_PREFIX)

  return app


app = create_app()
