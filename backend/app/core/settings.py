from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    ALLOWED_ORIGINS_STR: str = "http://localhost:3000,http://localhost:8000,http://localhost:5173"

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",")]

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "byob_pos"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def reject_insecure_secret(cls, v: str) -> str:
        insecure_defaults = {
            "change-me-secret-key-32-chars-minimum-token",
            "secret",
            "changeme",
        }
        if v.strip().lower() in {s.lower() for s in insecure_defaults}:
            raise ValueError(
                "JWT_SECRET_KEY is set to an insecure default. "
                "Set a strong, random secret in your .env file."
            )
        if len(v) < 32:
            raise ValueError(
                "JWT_SECRET_KEY must be at least 32 characters long."
            )
        return v

    OVH_S3_ENDPOINT_URL: str = ""
    OVH_S3_BASE_URL: str = ""
    OVH_S3_ACCESS_KEY: str = ""
    OVH_S3_SECRET_KEY: str = ""
    OVH_S3_BUCKET_NAME: str = ""
    OVH_S3_REGION: str = "gra"
    OVH_S3_KEY_PREFIX: str = ""

    RBAC_SEED_ON_STARTUP: bool = True
    LOOKUPS_SEED_ON_STARTUP: bool = True

    INVOICE_AUDIT_LOG_PATH: str = "logs/invoice-audit.jsonl"
    INVOICE_AUDIT_MAX_BYTES: int = Field(default=10 * 1024 * 1024, ge=1)
    INVOICE_AUDIT_BACKUPS: int = Field(default=30, ge=1)
    INVOICE_AUDIT_POLL_SECONDS: float = Field(default=5.0, gt=0)

    WHATSAPP_ENABLED: bool = False
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""
    TWILIO_WEBHOOK_URL: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
