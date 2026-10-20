from slowapi import Limiter
from slowapi.util import get_remote_address

# Global rate limiter using client IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    storage_uri="memory://",
)
