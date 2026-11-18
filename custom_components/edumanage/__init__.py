"""The EduManage integration."""
from __future__ import annotations

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import EduManageApiError, EduManageClient
from .const import (
    ATTR_ROUTINE_ID,
    CONF_API_KEY,
    CONF_BASE_URL,
    CONF_SCAN_INTERVAL,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    PLATFORMS,
    SERVICE_CANCEL_QUEUE,
    SERVICE_QUEUE_ROUTINE,
)
from .coordinator import EduManageCoordinator


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up EduManage from a config entry."""
    session = async_get_clientsession(hass)
    client = EduManageClient(
        session,
        entry.data[CONF_BASE_URL],
        entry.data[CONF_API_KEY],
    )
    scan_interval = entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
    coordinator = EduManageCoordinator(hass, client, scan_interval)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    _register_services(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        if not hass.data[DOMAIN]:
            hass.services.async_remove(DOMAIN, SERVICE_QUEUE_ROUTINE)
            hass.services.async_remove(DOMAIN, SERVICE_CANCEL_QUEUE)
    return unload_ok


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


def _register_services(hass: HomeAssistant) -> None:
    """Register integration services (idempotent)."""
    if hass.services.has_service(DOMAIN, SERVICE_QUEUE_ROUTINE):
        return

    async def _queue_routine(call: ServiceCall) -> None:
        routine_id: str = call.data[ATTR_ROUTINE_ID]
        coordinators: list[EduManageCoordinator] = list(
            hass.data.get(DOMAIN, {}).values()
        )
        if not coordinators:
            raise HomeAssistantError("EduManage integration not loaded")
        coord = coordinators[0]
        try:
            await coord.client.queue_workout(routine_id)
        except EduManageApiError as err:
            raise HomeAssistantError(str(err)) from err
        await coord.async_request_refresh()

    async def _cancel_queue(call: ServiceCall) -> None:
        coordinators: list[EduManageCoordinator] = list(
            hass.data.get(DOMAIN, {}).values()
        )
        if not coordinators:
            raise HomeAssistantError("EduManage integration not loaded")
        coord = coordinators[0]
        try:
            for entry in coord.data.get("queue", []):
                await coord.client.delete_queue(entry["id"])
        except EduManageApiError as err:
            raise HomeAssistantError(str(err)) from err
        await coord.async_request_refresh()

    hass.services.async_register(
        DOMAIN,
        SERVICE_QUEUE_ROUTINE,
        _queue_routine,
        schema=vol.Schema({vol.Required(ATTR_ROUTINE_ID): cv.string}),
    )
    hass.services.async_register(DOMAIN, SERVICE_CANCEL_QUEUE, _cancel_queue)
