"""Dynamic per-routine Start buttons for EduManage."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .api import EduManageApiError
from .const import DOMAIN
from .coordinator import EduManageCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: EduManageCoordinator = hass.data[DOMAIN][entry.entry_id]
    known: set[str] = set()

    @callback
    def _sync_entities() -> None:
        new_entities: list[StartRoutineButton] = []
        for routine in coordinator.data.get("routines", []):
            routine_id = routine.get("id")
            if not routine_id or routine_id in known:
                continue
            known.add(routine_id)
            new_entities.append(
                StartRoutineButton(coordinator, entry.entry_id, routine_id)
            )
        if new_entities:
            async_add_entities(new_entities)

    _sync_entities()
    entry.async_on_unload(coordinator.async_add_listener(_sync_entities))


class StartRoutineButton(CoordinatorEntity[EduManageCoordinator], ButtonEntity):
    _attr_has_entity_name = True
    _attr_icon = "mdi:play-circle"

    def __init__(
        self,
        coordinator: EduManageCoordinator,
        entry_id: str,
        routine_id: str,
    ) -> None:
        super().__init__(coordinator)
        self._routine_id = routine_id
        self._attr_unique_id = f"{entry_id}_start_{routine_id}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="EduManage",
            manufacturer="EduManage",
            configuration_url=coordinator.client.base_url,
            entry_type=DeviceEntryType.SERVICE,
        )

    def _routine(self) -> dict | None:
        for routine in self.coordinator.data.get("routines", []):
            if routine.get("id") == self._routine_id:
                return routine
        return None

    @property
    def name(self) -> str:
        routine = self._routine()
        return f"Start {routine['name']}" if routine else "Start routine"

    @property
    def available(self) -> bool:
        return super().available and self._routine() is not None

    async def async_press(self) -> None:
        try:
            await self.coordinator.client.queue_workout(self._routine_id)
        except EduManageApiError as err:
            raise HomeAssistantError(str(err)) from err
        await self.coordinator.async_request_refresh()
