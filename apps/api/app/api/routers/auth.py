"""Authentication endpoints."""

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_authenticated_user
from app.auth.schemas import AuthenticatedUser

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=AuthenticatedUser)
async def read_authenticated_user(user: AuthenticatedUser = Depends(get_authenticated_user)) -> AuthenticatedUser:
  """Return the authenticated user's claims."""
  return user
