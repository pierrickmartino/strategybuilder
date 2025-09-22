"""SQLAlchemy declarative base."""

from sqlalchemy.orm import DeclarativeBase, declared_attr


class Base(DeclarativeBase):
  """Base declarative class that applies naming conventions."""

  @declared_attr.directive
  def __tablename__(cls) -> str:  # type: ignore[misc]
    return cls.__name__.lower()
