"""Database session and engine helpers."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings

_settings = get_settings()
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
  """Return a lazily initialised async engine."""
  global _engine
  if _engine is None:
    _engine = create_async_engine(_settings.database_url, echo=False, future=True)
  return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
  """Return the async session factory."""
  global _session_factory
  if _session_factory is None:
    _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
  return _session_factory


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
  """Provide a transactional scope around a series of operations."""
  session = get_session_factory()()
  try:
    yield session
    await session.commit()
  except Exception:  # pragma: no cover - re-raised for caller handling
    await session.rollback()
    raise
  finally:
    await session.close()


async def get_db() -> AsyncIterator[AsyncSession]:
  """FastAPI dependency that yields a database session."""
  async with session_scope() as session:
    yield session
