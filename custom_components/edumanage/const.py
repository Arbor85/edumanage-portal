"""Constants for the EduManage integration."""
from __future__ import annotations

from homeassistant.const import Platform

DOMAIN = "edumanage"
PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BUTTON]

CONF_BASE_URL = "base_url"
CONF_API_KEY = "api_key"
CONF_SCAN_INTERVAL = "scan_interval"

DEFAULT_SCAN_INTERVAL = 30
MIN_SCAN_INTERVAL = 10
MAX_SCAN_INTERVAL = 600

SERVICE_QUEUE_ROUTINE = "queue_routine"
SERVICE_CANCEL_QUEUE = "cancel_queue"
ATTR_ROUTINE_ID = "routine_id"
