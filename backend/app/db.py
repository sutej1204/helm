from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


def _normalize_url(url: str) -> str:
    # Render's default scheme is `postgresql://` — psycopg 3 accepts that, but
    # SQLAlchemy prefers `postgresql+psycopg://` to pick the v3 driver explicitly.
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


_engine = create_engine(
    _normalize_url(get_settings().database_url),
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_engine():
    return _engine
