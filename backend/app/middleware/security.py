from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.settings import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds standard security headers to all responses (CRIT-04):
    - X-Frame-Options: DENY (anti-clickjacking)
    - X-Content-Type-Options: nosniff (anti-MIME-sniffing)
    - Strict-Transport-Security: HSTS (enforced in non-dev, or enabled generally)
    - Referrer-Policy: strict-origin-when-cross-origin
    - Permissions-Policy: camera=(), microphone=(), geolocation=()
    - Cache-Control: no-store on sensitive API endpoints
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Standard protection headers
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # HSTS in production/staging environments
        if settings.APP_ENV != "development":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # Prevent browser caching of authenticated API responses
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"

        return response
