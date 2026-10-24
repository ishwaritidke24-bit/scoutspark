from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional, Union
import os
import json

_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_DEFAULT_DB_FILE = os.path.join(_BACKEND_DIR, "scoutspark.db").replace("\\", "/")
_DEFAULT_DB_URL = f"sqlite:///{_DEFAULT_DB_FILE}"

_DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


class Settings(BaseSettings):
    app_name: str = "ScoutSpark Backend"
    version: str = "1.0.0"
    database_url: str = _DEFAULT_DB_URL
    cors_origins: Union[List[str], str] = _DEFAULT_CORS_ORIGINS
    cors_origin_regex: Optional[str] = r"^https:\/\/.*\.vercel\.app$"
    frontend_url: Optional[str] = None
    demo_mode: bool = False

    # Stage 3: Live Research Provider Configurations
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    tavily_api_key: Optional[str] = None
    scoutspark_research_mode: str = "demo"

    @field_validator("cors_origins", mode="after")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        origins: List[str] = []
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        origins = [str(item).strip().rstrip("/") for item in parsed if str(item).strip()]
                except Exception:
                    origins = [item.strip().rstrip("/") for item in v_str.strip("[]").split(",") if item.strip()]
            else:
                origins = [item.strip().rstrip("/") for item in v_str.split(",") if item.strip()]
        elif isinstance(v, list):
            origins = [str(item).strip().rstrip("/") for item in v if str(item).strip()]

        # Wildcard takes precedence
        if "*" in origins:
            return ["*"]

        # Ensure default local origins are always available for development
        for default_origin in _DEFAULT_CORS_ORIGINS:
            cleaned_default = default_origin.rstrip("/")
            if cleaned_default not in origins:
                origins.append(cleaned_default)

        return origins

    @property
    def is_live_configured(self) -> bool:
        """Returns True if both Gemini and Tavily API keys are non-empty."""
        return bool(self.gemini_api_key and self.gemini_api_key.strip() and 
                    self.tavily_api_key and self.tavily_api_key.strip())

    @property
    def effective_research_mode(self) -> str:
        """Effective mode: 'live' if keys exist and requested, else 'demo'."""
        if self.is_live_configured and self.scoutspark_research_mode.lower() == "live":
            return "live"
        return "demo"

    model_config = SettingsConfigDict(
        env_file=["backend/.env", ".env"],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# If frontend_url is explicitly provided, ensure it's in settings.cors_origins
if settings.frontend_url:
    clean_frontend = settings.frontend_url.strip().rstrip("/")
    if clean_frontend and clean_frontend not in settings.cors_origins and "*" not in settings.cors_origins:
        if isinstance(settings.cors_origins, list):
            settings.cors_origins.append(clean_frontend)

