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
