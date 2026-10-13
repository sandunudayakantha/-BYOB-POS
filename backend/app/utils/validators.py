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
