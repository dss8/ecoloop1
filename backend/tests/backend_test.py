"""ECOLOOP backend pytest suite.

Covers: health, AI design generation, saved designs CRUD with dev-trust auth,
orders, Stripe checkout session + status, and auth enforcement.
"""
from __future__ import annotations

import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://design-eco-lab.preview.emergentagent.com",
).rstrip("/")
API = f"{BASE_URL}/api"

TEST_UID = f"TEST_UID_{uuid.uuid4().hex[:8]}"
TEST_EMAIL = f"TEST_{uuid.uuid4().hex[:6]}@example.com"
AUTH_HEADERS = {"X-User-Id": TEST_UID, "X-User-Email": TEST_EMAIL}


# ---------------------- Fixtures ----------------------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", **AUTH_HEADERS})
    return s


@pytest.fixture(scope="session")
def generated_image_b64(api_client):
    """Generate a design once and reuse for saved-design tests."""
    r = api_client.post(f"{API}/generate-design", json={"prompt": "minimal pine logo"}, timeout=90)
    if r.status_code != 200:
        pytest.skip(f"Design generation failed (status {r.status_code}): {r.text[:200]}")
    return r.json()["image_base64"]


# ---------------------- Health ----------------------
class TestHealth:
    def test_root_health(self, api_client):
        r = api_client.get(f"{API}/", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("service") == "ECOLOOP"
        assert data.get("ok") is True
        assert data.get("llm_configured") is True, "EMERGENT_LLM_KEY must be configured"
        assert data.get("stripe_configured") is True, "STRIPE_API_KEY must be configured"


# ---------------------- AI Design ----------------------
class TestDesignGeneration:
    def test_generate_design_returns_image(self, api_client):
        r = api_client.post(
            f"{API}/generate-design",
            json={"prompt": "minimal pine logo"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "image_base64" in data
        assert data["image_base64"].startswith("data:"), "image_base64 should be a data URI"
        assert ";base64," in data["image_base64"]
        assert data.get("mime_type", "").startswith("image/")
        assert data.get("prompt") == "minimal pine logo"
        assert isinstance(data.get("enhanced_prompt"), str) and len(data["enhanced_prompt"]) > 20

    def test_generate_design_validation_short_prompt(self, api_client):
        r = api_client.post(f"{API}/generate-design", json={"prompt": "a"}, timeout=20)
        assert r.status_code in (400, 422), r.text


# ---------------------- Auth Enforcement ----------------------
class TestAuthEnforcement:
    def test_saved_designs_requires_auth(self, api_client):
        r = api_client.get(f"{API}/saved-designs", timeout=15)
        assert r.status_code == 401

    def test_orders_requires_auth(self, api_client):
        r = api_client.get(f"{API}/orders", timeout=15)
        assert r.status_code == 401


# ---------------------- Saved Designs CRUD ----------------------
class TestSavedDesignsCRUD:
    _created_id = None

    def test_list_empty_initially(self, auth_client):
        r = auth_client.get(f"{API}/saved-designs", timeout=15)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_create_saved_design(self, auth_client, generated_image_b64):
        payload = {
            "prompt": "TEST minimal pine logo",
            "image_base64": generated_image_b64,
            "tshirt_color": "#2d5a3d",
            "text": "TEST_LABEL",
            "text_color": "#ffffff",
            "material": "Organic Cotton",
        }
        r = auth_client.post(f"{API}/saved-designs", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["uid"] == TEST_UID
        assert d["prompt"] == payload["prompt"]
        assert d["text"] == "TEST_LABEL"
        assert "id" in d
        TestSavedDesignsCRUD._created_id = d["id"]

    def test_list_contains_created(self, auth_client):
        assert TestSavedDesignsCRUD._created_id, "prior create test must pass"
        r = auth_client.get(f"{API}/saved-designs", timeout=15)
        assert r.status_code == 200
        ids = [row["id"] for row in r.json()]
        assert TestSavedDesignsCRUD._created_id in ids

    def test_delete_saved_design(self, auth_client):
        cid = TestSavedDesignsCRUD._created_id
        assert cid, "prior create test must pass"
        r = auth_client.delete(f"{API}/saved-designs/{cid}", timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("deleted") is True

        # Verify removal
        r2 = auth_client.get(f"{API}/saved-designs", timeout=15)
        ids = [row["id"] for row in r2.json()]
        assert cid not in ids

    def test_delete_nonexistent_returns_404(self, auth_client):
        r = auth_client.delete(f"{API}/saved-designs/does-not-exist-xyz", timeout=15)
        assert r.status_code == 404


# ---------------------- Orders ----------------------
class TestOrders:
    def test_orders_list(self, auth_client):
        r = auth_client.get(f"{API}/orders", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------------- Stripe Checkout ----------------------
class TestCheckout:
    _session_id = None

    def test_create_checkout_session(self, auth_client):
        payload = {
            "items": [
                {
                    "id": 1,
                    "name": "Test Tee",
                    "price": 899.0,
                    "image": "/x.jpg",
                    "color": "#000",
                    "size": "M",
                    "material": "Cotton",
                    "quantity": 1,
                    "isCustom": False,
                }
            ],
            "origin_url": BASE_URL,
            "address": "TEST address",
        }
        r = auth_client.post(f"{API}/checkout/session", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("http")
        assert "session_id" in data and len(data["session_id"]) > 5
        TestCheckout._session_id = data["session_id"]

    def test_checkout_empty_cart_rejected(self, auth_client):
        payload = {"items": [], "origin_url": BASE_URL}
        r = auth_client.post(f"{API}/checkout/session", json=payload, timeout=15)
        assert r.status_code == 400

    def test_checkout_status_returns_paid(self, auth_client):
        sid = TestCheckout._session_id
        assert sid, "prior create-session test must pass"
        r = auth_client.get(f"{API}/checkout/status/{sid}", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("payment_status") == "paid", f"expected paid, got {d}"
        assert d.get("status") in ("complete", "open")
        assert isinstance(d["amount_total"], (int, float))
        assert d["currency"].lower() == "inr"
        assert d.get("order_id"), "order_id should be present"
        TestCheckout._order_id = d["order_id"]

    def test_checkout_status_idempotent(self, auth_client):
        """Calling status twice should NOT create a duplicate order."""
        sid = TestCheckout._session_id
        assert sid
        r1 = auth_client.get(f"{API}/checkout/status/{sid}", timeout=30)
        r2 = auth_client.get(f"{API}/checkout/status/{sid}", timeout=30)
        assert r1.status_code == 200 and r2.status_code == 200
        assert r1.json().get("order_id") == r2.json().get("order_id")

        # Orders listing should show exactly one order with this session_id / order_id
        orders_resp = auth_client.get(f"{API}/orders", timeout=15)
        assert orders_resp.status_code == 200
        order_id = r1.json().get("order_id")
        matches = [o for o in orders_resp.json() if o.get("id") == order_id]
        assert len(matches) == 1, f"expected 1 order, found {len(matches)}"
        assert matches[0].get("payment_status") == "paid"
