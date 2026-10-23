from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os


class Settings(BaseSettings):
    app_name: str = "ScoutSpark Backend"
    version: str = "1.0.0"
    database_url: str = "sqlite:///./backend/scoutspark.db"
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
    demo_mode: bool = False

    # Stage 3: Live Research Provider Configurations
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    tavily_api_key: Optional[str] = None
    scoutspark_research_mode: str = "demo"

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
