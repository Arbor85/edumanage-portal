"""Sensors for the EduManage integration."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import EduManageCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: EduManageCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [
            QueuedRoutineSensor(coordinator, entry.entry_id),
            RoutinesCountSensor(coordinator, entry.entry_id),
        ]
    )


def _device_info(entry_id: str, base_url: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry_id)},
        name="EduManage",
        manufacturer="EduManage",
        configuration_url=base_url,
        entry_type=DeviceEntryType.SERVICE,
    )


class QueuedRoutineSensor(CoordinatorEntity[EduManageCoordinator], SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Queued routine"
    _attr_icon = "mdi:playlist-play"

    def __init__(self, coordinator: EduManageCoordinator, entry_id: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_queued_routine"
        self._attr_device_info = _device_info(entry_id, coordinator.client.base_url)

    @property
    def native_value(self) -> str:
        queue = self.coordinator.data.get("queue", [])
        if not queue:
            return "none"
        routine_id = queue[0].get("routineId")
        for routine in self.coordinator.data.get("routines", []):
            if routine.get("id") == routine_id:
                return routine.get("name", routine_id)
        return routine_id or "unknown"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        queue = self.coordinator.data.get("queue", [])
        if not queue:
            return {}
        entry = queue[0]
        return {
            "queue_id": entry.get("id"),
            "routine_id": entry.get("routineId"),
            "source": entry.get("source"),
            "created_at": entry.get("createdAt"),
        }


class RoutinesCountSensor(CoordinatorEntity[EduManageCoordinator], SensorEntity):
    _attr_has_entity_name = True
    _attr_name = "Routines"
    _attr_icon = "mdi:format-list-bulleted"

    def __init__(self, coordinator: EduManageCoordinator, entry_id: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry_id}_routines_count"
        self._attr_device_info = _device_info(entry_id, coordinator.client.base_url)

    @property
    def native_value(self) -> int:
        return len(self.coordinator.data.get("routines", []))
