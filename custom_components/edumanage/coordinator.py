"""Data coordinator for the EduManage integration."""
from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import EduManageApiError, EduManageClient
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class EduManageCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls routines + queue on a fixed interval."""

    def __init__(
        self,
        hass: HomeAssistant,
        client: EduManageClient,
        scan_interval: int,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=scan_interval),
        )
        self.client = client

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            routines = await self.client.list_routines()
            queue = await self.client.list_queue()
        except EduManageApiError as err:
            raise UpdateFailed(str(err)) from err
        return {"routines": routines, "queue": queue}
