"""Async client for the EduManage backend."""
from __future__ import annotations

import asyncio
from typing import Any

import aiohttp


class EduManageApiError(Exception):
    """Raised when the backend returns a non-2xx response or the request fails."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status


class EduManageClient:
    """Thin async wrapper around the EduManage HTTP API."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        base_url: str,
        api_key: str,
    ) -> None:
        self._session = session
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key

    @property
    def base_url(self) -> str:
        return self._base_url

    async def _request(
        self,
        method: str,
        path: str,
        json: Any | None = None,
    ) -> Any:
        url = f"{self._base_url}{path}"
        headers = {"X-Api-Key": self._api_key, "Accept": "application/json"}
        try:
            async with self._session.request(
                method,
                url,
                headers=headers,
                json=json,
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                if resp.status == 401:
                    raise EduManageApiError(401, "Invalid API key")
                if resp.status >= 400:
                    body = await resp.text()
                    raise EduManageApiError(
                        resp.status, f"Request failed ({resp.status}): {body[:200]}"
                    )
                if resp.status == 204:
                    return None
                return await resp.json()
        except asyncio.TimeoutError as err:
            raise EduManageApiError(0, "Request timed out") from err
        except aiohttp.ClientError as err:
            raise EduManageApiError(0, str(err)) from err

    async def list_routines(self) -> list[dict[str, Any]]:
        data = await self._request("GET", "/api/routines")
        return data or []

    async def list_queue(self) -> list[dict[str, Any]]:
        data = await self._request("GET", "/api/workouts/queue")
        return data or []

    async def queue_workout(self, routine_id: str) -> dict[str, Any]:
        return await self._request(
            "POST",
            "/api/workouts/queue",
            {"routineId": routine_id, "source": "ha"},
        )

    async def delete_queue(self, queue_id: str) -> None:
        await self._request("DELETE", f"/api/workouts/queue/{queue_id}")
