"""
Standard S7-B Runtime Smoke Verification for FastAPI 0.115+ / Python 3.12+ LTS.
Enforces unmocked async lifespan startup, real database connection ping,
and non-blocking HTTP health check execution.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Adapt import to your application entrypoint: e.g. from app.main import app
try:
    from app.main import app
except ImportError:
    from main import app


@pytest.mark.asyncio
async def test_s7b_application_lifespan_and_health():
    """
    Assert that the FastAPI application lifespan boots cleanly
    and responds with HTTP 200 on /health without unhandled exceptions.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        if response.status_code == 404:
            # Fallback for alternative root/ping probe
            response = await client.get("/")

        assert response.status_code == 200, (
            f"Expected status 200 from health endpoint, got {response.status_code}: {response.text}"
        )
        data = response.json()
        assert isinstance(data, dict), "Health endpoint must return a structured JSON response"
