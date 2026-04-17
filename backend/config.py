"""
Application configuration — loads environment variables and exposes settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Groq / LLM ───────────────────────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
LLM_PRIMARY_MODEL: str = "gemma2-9b-it"
LLM_FALLBACK_MODEL: str = "llama-3.3-70b-versatile"

# ── Database ──────────────────────────────────────────────────────────────────
# Default to MySQL, fallback to SQLite for easy demonstration
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite:///./hcp_crm.db",
)

# ── App ───────────────────────────────────────────────────────────────────────
APP_TITLE: str = "MedSync AI — HCP CRM"
APP_VERSION: str = "1.0.0"
CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]
