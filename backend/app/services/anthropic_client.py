"""Thin wrapper around the Anthropic SDK.

Centralises:
  - lazy client construction (so missing key surfaces as 503, not import error)
  - one place to swap models or tweak defaults
  - a uniform error shape for routers
"""
from __future__ import annotations

from functools import lru_cache

from anthropic import Anthropic, APIStatusError, APIConnectionError
from fastapi import HTTPException, status

from ..config import get_settings


class AIUnavailable(HTTPException):
    """503 raised when the Anthropic API key is unset or the call fails.

    Routers can catch this — or let it propagate as a normal HTTPException
    and FastAPI returns the right status code.
    """

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail
        )


@lru_cache(maxsize=1)
def _client() -> Anthropic | None:
    key = get_settings().anthropic_api_key
    if not key:
        return None
    return Anthropic(api_key=key)


def is_configured() -> bool:
    return _client() is not None


def complete(
    *,
    system: str,
    user: str,
    max_tokens: int = 1024,
    model: str | None = None,
    prefill: str | None = None,
) -> str:
    """Make a non-streaming Messages call. Returns the joined text reply.

    `prefill` puts a partial assistant message in front of Claude's response,
    forcing it to continue from there. Useful for guaranteed JSON output:
    pass `prefill='{'` and the response will start as a JSON object — the
    function automatically prepends '{' back so the caller sees complete JSON.
    """
    client = _client()
    if client is None:
        raise AIUnavailable(
            "ANTHROPIC_API_KEY is not configured on this deployment. "
            "Set it in backend/.env (local) or the service's Environment tab (Render)."
        )

    messages: list[dict] = [{"role": "user", "content": user}]
    if prefill is not None:
        messages.append({"role": "assistant", "content": prefill})

    settings = get_settings()
    try:
        message = client.messages.create(
            model=model or settings.anthropic_model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
        )
    except APIStatusError as e:
        # Surface Anthropic's status code as-is so 401 keys, 429 rate limits,
        # etc. show up correctly in the browser network panel.
        raise HTTPException(status_code=e.status_code, detail=str(e)) from e
    except APIConnectionError as e:
        raise AIUnavailable(f"Could not reach Anthropic: {e}") from e

    parts = [b.text for b in message.content if getattr(b, "type", None) == "text"]
    body = "\n".join(parts).strip()
    return (prefill + body) if prefill else body
