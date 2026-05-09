from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env BEFORE Settings is instantiated so values override anything that
# might already be in os.environ (e.g. a user-level Windows env var set to "").
# On Render there is no .env file, so this is a silent no-op and the real
# env vars from the dashboard apply.
load_dotenv(override=True)


class Settings(BaseSettings):
    database_url: str
    helm_api_token: str | None = None
    static_dir: str = "app/static"
    cors_origins: str = "*"
    # AI features (Helm AI Resolver, supply-chain chat, contract ingestion).
    # When unset, AI endpoints return a stubbed response so the UI still
    # renders without leaking errors.
    anthropic_api_key: str | None = None
    # Haiku 4.5 is fast (~3-5s) and quality is sufficient for the prose +
    # structured-extraction tasks we run. Override via ANTHROPIC_MODEL env
    # var if any single endpoint ever needs Sonnet/Opus reasoning depth.
    anthropic_model: str = "claude-haiku-4-5-20251001"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
