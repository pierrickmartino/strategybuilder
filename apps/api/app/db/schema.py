"""Database schema helpers used to patch legacy environments."""

from __future__ import annotations

from collections.abc import Iterable

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


async def _get_existing_columns(connection: AsyncConnection, table_name: str) -> set[str]:
  """Return the set of column names present in ``table_name``."""

  result = await connection.execute(
    text(
      """
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = :table
      """
    ),
    {"table": table_name}
  )
  return {row[0] for row in result}


async def _run_statements(connection: AsyncConnection, statements: Iterable[str]) -> None:
  """Execute the raw SQL statements sequentially."""

  for statement in statements:
    await connection.execute(text(statement))


async def ensure_strategy_versions_schema(connection: AsyncConnection) -> None:
  """Backfill new columns for ``strategy_versions`` if they are missing.

  Earlier sandbox databases were provisioned with an older table layout that
  lacked several columns now required by the API.  Locally bootstrapped
  databases (via ``Base.metadata.create_all``) already have the expected
  schema, so we only run the corrective statements when connecting to a
  PostgreSQL database that is missing the newer columns.
  """

  if connection.dialect.name != "postgresql":
    # SQLite is used in tests and already matches the ORM schema.
    return

  existing = await _get_existing_columns(connection, "strategy_versions")
  statements: list[str] = []

  if "version" not in existing:
    statements.append(
      "ALTER TABLE strategy_versions ADD COLUMN version INTEGER NOT NULL DEFAULT 1"
    )
    statements.append("UPDATE strategy_versions SET version = 1 WHERE version IS NULL")
    statements.append(
      "CREATE UNIQUE INDEX IF NOT EXISTS strategy_versions_strategy_id_version_idx "
      "ON strategy_versions (strategy_id, version)"
    )

  if "label" not in existing:
    statements.append(
      "ALTER TABLE strategy_versions ADD COLUMN label VARCHAR(64) NOT NULL DEFAULT 'Auto Save'"
    )

  if "educator_callouts" not in existing:
    statements.append(
      "ALTER TABLE strategy_versions ADD COLUMN educator_callouts JSONB NOT NULL DEFAULT '[]'::jsonb"
    )

  if "validation_issues" not in existing:
    statements.append(
      "ALTER TABLE strategy_versions ADD COLUMN validation_issues JSONB NOT NULL DEFAULT '[]'::jsonb"
    )

  if "updated_at" not in existing:
    statements.append(
      "ALTER TABLE strategy_versions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()"
    )

  if statements:
    await _run_statements(connection, statements)
