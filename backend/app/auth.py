from fastapi import Header, HTTPException, status

from .config import get_settings


async def require_token(authorization: str | None = Header(default=None)) -> None:
    """Bearer-token guard used as a router-level dependency.

    Disabled when `HELM_API_TOKEN` is unset, so local dev without a token
    keeps working. In production set the env var to enable enforcement.
    """
    expected = get_settings().helm_api_token
    if not expected:
        return
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    presented = authorization.split(" ", 1)[1].strip()
    if presented != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
