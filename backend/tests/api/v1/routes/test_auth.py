def test_health_check(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "success"
    assert r.json()["data"]["status"] == "healthy"

def test_login_and_me(client, auth_headers, test_user):
    r = client.get("/api/v1/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "success"
    assert r.json()["data"]["email"] == test_user.email


def test_security_headers_present(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.headers.get("x-frame-options") == "DENY"
    assert r.headers.get("x-content-type-options") == "nosniff"
    assert r.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "no-store" in r.headers.get("cache-control", "")


def test_login_sets_httponly_cookie_and_refreshes(client, test_user):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": test_user.email, "password": "Password123!"},
    )
    assert login_res.status_code == 200
    assert "refresh_token" in login_res.cookies

    # Test refresh endpoint using the cookie
    refresh_res = client.post("/api/v1/auth/refresh")
    assert refresh_res.status_code == 200
    assert refresh_res.json()["data"]["access_token"] is not None
    assert "refresh_token" in refresh_res.cookies


def test_logout_clears_cookie(client, auth_headers):
    logout_res = client.post("/api/v1/auth/logout", headers=auth_headers)
    assert logout_res.status_code == 200
    # Cookie is deleted
    assert logout_res.cookies.get("refresh_token") is None or logout_res.headers.get("set-cookie", "").find("refresh_token=\"\"") != -1 or "Max-Age=0" in logout_res.headers.get("set-cookie", "")


def test_registration_requires_super_admin(client, auth_headers):
    # Anonymous request
    anon_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Attacker",
            "email": "attacker@test.com",
            "password": "Password123!",
            "role": "SUPER_ADMIN",
        },
    )
    assert anon_res.status_code in (401, 403)

    # Restaurant owner request (not super admin)
    owner_res = client.post(
        "/api/v1/auth/register",
        headers=auth_headers,
        json={
            "name": "Attacker",
            "email": "attacker@test.com",
            "password": "Password123!",
            "role": "SUPER_ADMIN",
        },
    )
    assert owner_res.status_code == 403

