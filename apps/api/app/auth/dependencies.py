"""FastAPI dependencies for Supabase-authenticated routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser, SupabaseJWTClaims
from app.config import Settings, get_settings
from app.db.session import get_db
from app.services.user_service import sync_user_from_claims

ALLOWED_JWT_ALGORITHMS = ["HS256"]


def _extract_token_from_headers(request: Request) -> str | None:
  header = request.headers.get("Authorization")
  if not header:
    return None
  scheme, _, token = header.partition(" ")
  if scheme.lower() != "bearer" or not token:
    return None
  return token


def _extract_token_from_cookies(request: Request) -> str | None:
  return request.cookies.get("sb-access-token")


async def get_authenticated_user(
  request: Request,
  settings: Annotated[Settings, Depends(get_settings)],
  session: Annotated[AsyncSession, Depends(get_db)]
) -> AuthenticatedUser:
  """Validate the Supabase JWT and synchronise user metadata."""
  token = _extract_token_from_headers(request) or _extract_token_from_cookies(request)
  if not token:
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

  try:
    payload = jwt.decode(
      token,
      settings.supabase_jwt_secret,
      algorithms=ALLOWED_JWT_ALGORITHMS,
      audience=settings.supabase_api_audience,
      options={"verify_aud": bool(settings.supabase_api_audience)}
    )
  except JWTError as exc:  # pragma: no cover - auth failure path
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token") from exc

  claims = SupabaseJWTClaims.from_token(payload)

  actor = AuthenticatedUser(
    id=claims.sub,
    email=claims.email,
    roles=claims.app_metadata.roles,
    accepted_simulation_only=claims.user_metadata.accepted_simulation_only,
    accepted_simulation_only_at=claims.user_metadata.accepted_simulation_only_at,
    raw_claims=claims
  )

  await sync_user_from_claims(session, actor)
  return actor


async def require_compliance_consent(
  user: Annotated[AuthenticatedUser, Depends(get_authenticated_user)]
) -> AuthenticatedUser:
  """Ensure the authenticated user has accepted the simulation-only consent."""
  if not user.has_compliance_consent:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Simulation-only consent required before accessing workspace"
    )
  return user
