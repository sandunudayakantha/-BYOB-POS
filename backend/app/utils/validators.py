import re

PHONE_REGEX = re.compile(r"^\+?[0-9\s\-\(\)]{7,25}$")


def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number")
    return password


def validate_phone_number(phone: str) -> str:
    cleaned = phone.strip()
    if not PHONE_REGEX.match(cleaned):
        raise ValueError("Invalid phone number format")
    return cleaned


def validate_safe_url(url: str | None) -> str | None:
    """
    Validates that a URL does not use dangerous pseudo-protocols
    like javascript:, data:, or vbscript: (preventing stored XSS).
    Must be relative (starts with /) or absolute (http:// or https://).
    """
    if not url:
        return url
    cleaned = url.strip()
    if not cleaned:
        return ""
    lower_url = cleaned.lower()
    if lower_url.startswith(("javascript:", "data:", "vbscript:")):
        raise ValueError("URL contains a dangerous or disallowed protocol")
    if not (lower_url.startswith("http://") or lower_url.startswith("https://") or lower_url.startswith("/")):
        raise ValueError("URL must start with http://, https://, or /")
    if "\x00" in cleaned:
        raise ValueError("URL contains illegal null character")
    return cleaned
