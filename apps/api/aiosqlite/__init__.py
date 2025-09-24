"""Lightweight asyncio-compatible sqlite3 wrapper for testing.

This implementation provides a minimal subset of the :mod:`aiosqlite`
interface that is sufficient for the project's unit tests.  It exposes
awaitable connection and cursor objects that mimic the behaviour of the
real ``aiosqlite`` package without requiring the external dependency.
"""

from __future__ import annotations

import asyncio
import sqlite3
from typing import Any, Iterable, Optional, Sequence

# Re-export SQLite error hierarchy and utility constants so that SQLAlchemy's
# adapter sees the attributes it expects from the third-party library.
Error = sqlite3.Error
DatabaseError = sqlite3.DatabaseError
IntegrityError = sqlite3.IntegrityError
NotSupportedError = sqlite3.NotSupportedError
OperationalError = sqlite3.OperationalError
ProgrammingError = sqlite3.ProgrammingError

PARSE_DECLTYPES = sqlite3.PARSE_DECLTYPES
PARSE_COLNAMES = sqlite3.PARSE_COLNAMES
Binary = sqlite3.Binary
Row = sqlite3.Row
sqlite_version = sqlite3.sqlite_version
sqlite_version_info = sqlite3.sqlite_version_info


class _ImmediateQueue:
  """Queue-like shim used for isolation level updates."""

  def __init__(self, loop: asyncio.AbstractEventLoop) -> None:
    self._loop = loop

  def put_nowait(self, item: tuple[asyncio.Future, Any]) -> None:
    future, function = item
    try:
      result = function()
    except Exception as exc:  # pragma: no cover - exercised indirectly
      self._loop.call_soon(future.set_exception, exc)
    else:
      self._loop.call_soon(future.set_result, result)


class Cursor:
  """Async wrapper around :class:`sqlite3.Cursor`."""

  def __init__(self, connection: Connection, cursor: sqlite3.Cursor) -> None:
    self._connection = connection
    self._cursor = cursor

  async def execute(
    self,
    operation: str,
    parameters: Optional[Sequence[Any]] = None
  ) -> "Cursor":
    if parameters is None:
      await self._connection._call(self._cursor.execute, operation)
    else:
      await self._connection._call(self._cursor.execute, operation, parameters)
    return self

  async def executemany(
    self,
    operation: str,
    seq_of_parameters: Iterable[Sequence[Any]]
  ) -> "Cursor":
    await self._connection._call(
      self._cursor.executemany,
      operation,
      seq_of_parameters
    )
    return self

  async def fetchone(self) -> Optional[Sequence[Any]]:
    return await self._connection._call(self._cursor.fetchone)

  async def fetchmany(self, size: Optional[int] = None) -> Sequence[Sequence[Any]]:
    if size is None:
      return await self._connection._call(self._cursor.fetchmany)
    return await self._connection._call(self._cursor.fetchmany, size)

  async def fetchall(self) -> Sequence[Sequence[Any]]:
    return await self._connection._call(self._cursor.fetchall)

  async def close(self) -> None:
    await self._connection._call(self._cursor.close)

  async def __aenter__(self) -> "Cursor":
    return self

  async def __aexit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
    await self.close()

  @property
  def description(self) -> Optional[Sequence[Any]]:
    return self._cursor.description

  @property
  def rowcount(self) -> int:
    return self._cursor.rowcount

  @property
  def lastrowid(self) -> int:
    return self._cursor.lastrowid


class Connection:
  """Async wrapper around :class:`sqlite3.Connection`."""

  def __init__(self, connection: sqlite3.Connection, loop: asyncio.AbstractEventLoop) -> None:
    self._conn = connection
    self._loop = loop
    self._closed = False
    self._daemon = True
    self._tx = _ImmediateQueue(loop)

  # SQLAlchemy inspects this attribute directly for isolation management.
  @property
  def isolation_level(self) -> Optional[str]:
    return self._conn.isolation_level

  @isolation_level.setter
  def isolation_level(self, value: Optional[str]) -> None:
    self._conn.isolation_level = value

  @property
  def daemon(self) -> bool:
    return self._daemon

  @daemon.setter
  def daemon(self, value: bool) -> None:
    self._daemon = value

  async def cursor(self) -> Cursor:
    cursor = await self._call(self._conn.cursor)
    return Cursor(self, cursor)

  async def execute(
    self,
    operation: str,
    parameters: Optional[Sequence[Any]] = None
  ) -> Cursor:
    cursor = await self.cursor()
    await cursor.execute(operation, parameters)
    return cursor

  async def executemany(
    self,
    operation: str,
    seq_of_parameters: Iterable[Sequence[Any]]
  ) -> Cursor:
    cursor = await self.cursor()
    await cursor.executemany(operation, seq_of_parameters)
    return cursor

  async def commit(self) -> None:
    await self._call(self._conn.commit)

  async def rollback(self) -> None:
    await self._call(self._conn.rollback)

  async def close(self) -> None:
    if self._closed:
      return
    await self._call(self._conn.close)
    self._closed = True

  async def create_function(self, *args: Any, **kwargs: Any) -> None:
    await self._call(self._conn.create_function, *args, **kwargs)

  def __await__(self):  # pragma: no cover - trivial generator wrapper
    async def _ready() -> "Connection":
      return self

    return _ready().__await__()

  async def __aenter__(self) -> "Connection":
    return self

  async def __aexit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
    await self.close()

  async def _call(self, function: Any, *args: Any, **kwargs: Any) -> Any:
    if self._closed:
      raise RuntimeError("Connection is closed")
    return function(*args, **kwargs)


def connect(database: str, *args: Any, **kwargs: Any) -> Connection:
  """Create an asynchronous SQLite connection."""

  loop = asyncio.get_event_loop()
  connection = sqlite3.connect(database, *args, **kwargs)
  return Connection(connection, loop)


__all__ = [
  "Binary",
  "Connection",
  "Cursor",
  "DatabaseError",
  "Error",
  "IntegrityError",
  "NotSupportedError",
  "OperationalError",
  "PARSE_COLNAMES",
  "PARSE_DECLTYPES",
  "ProgrammingError",
  "Row",
  "connect",
  "sqlite_version",
  "sqlite_version_info"
]
