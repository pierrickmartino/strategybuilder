"""Application configuration settings."""

from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parents[3]
ENV_FILES = (
  REPO_ROOT / ".env",
  REPO_ROOT / ".env.local",
)


class Settings(BaseSettings):
  """Project settings loaded from environment variables."""

  app_env: str = "development"
  api_host: str = "127.0.0.1"
  api_port: int = 8000
  database_url: str = "sqlite+aiosqlite:///:memory:"
  redis_url: str = "redis://localhost:6379/0"
  supabase_url: str = "https://demo.supabase.co"
  supabase_service_role_key: str = "local-service-role"
  supabase_jwt_secret: str = "local-secret"
  supabase_api_audience: str = "authenticated"
  supabase_anon_key: str | None = None

  model_config = SettingsConfigDict(
    env_file=ENV_FILES,
    env_file_encoding="utf-8",
    extra="allow"
  )

  @property
  def supabase_project_id(self) -> str:
    """Derive the Supabase project id from the configured URL."""
    return self.supabase_url.split("//")[-1].split(".")[0]

  def dict(self, *args: Any, **kwargs: Any) -> dict[str, Any]:  # pragma: no cover - passthrough
    """Override BaseSettings.dict typing for mypy friendliness."""
    return super().model_dump(*args, **kwargs)


@lru_cache
def get_settings() -> Settings:
  """Return cached settings instance."""
  return Settings()
