"""Celery worker package for Strategy Builder."""

from .app import celery_app

__all__ = ["celery_app"]
