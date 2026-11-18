# EduManage — Home Assistant Integration

A proper HA integration that connects to your EduManage backend. Unlike the Lovelace card, this exposes your routines as **entities** (sensors, buttons) and **services** usable in automations, scripts, and voice assistants.

## What you get

| Entity | Type | Purpose |
|---|---|---|
| `sensor.edumanage_queued_routine` | sensor | Name of the currently queued routine, or `none`. Attributes include the queue id, routine id, source, and created-at timestamp. |
| `sensor.edumanage_routines` | sensor | Count of available routines. |
| `button.edumanage_start_<routine>` | button (one per routine, created dynamically) | Pressing queues that routine. |

Services:

- `edumanage.queue_routine` — `routine_id` (string). Queues a routine by ID.
- `edumanage.cancel_queue` — clears any pending queued routines.

## Install

### Manual (recommended today)

1. Copy the whole `custom_components/edumanage/` folder into your HA config directory:
   ```
   <ha-config>/custom_components/edumanage/
   ```
2. Restart Home Assistant.
3. **Settings → Devices & services → Add integration → EduManage**.
4. Enter your backend URL (e.g. `http://192.168.1.10:5090`) and API key from EduManage → Settings → MCP API Keys. HA validates both before saving.

### HACS (future)

HACS currently serves the Lovelace card from this repo's root `hacs.json` (category: plugin). Dual-category repos aren't supported, so to list the integration in HACS it will need its own repo. Until then, use the manual install above.

## Automations

Queue a routine every weekday morning:

```yaml
alias: Queue morning routine
trigger:
  - platform: time
    at: "06:30:00"
condition:
  - condition: time
    weekday: [mon, tue, wed, thu, fri]
action:
  - service: edumanage.queue_routine
    data:
      routine_id: !input morning_routine_id
```

Announce when a routine is queued:

```yaml
trigger:
  - platform: state
    entity_id: sensor.edumanage_queued_routine
    from: "none"
action:
  - service: tts.google_translate_say
    data:
      entity_id: media_player.kitchen
      message: "Your {{ states('sensor.edumanage_queued_routine') }} routine is queued."
```

Expose each routine as a button in a dashboard — all `button.edumanage_start_*` entities appear automatically; drop them into an `entities` or `grid` card.

## Options

**Settings → Devices & services → EduManage → Configure** lets you change the poll interval (10–600 s, default 30 s).

## Troubleshooting

- **Config flow rejects the key** — the backend returned 401; rotate the key.
- **Config flow says "cannot connect"** — check the URL is reachable from the HA host (not from your phone). Container deployments often need `http://host.docker.internal:5090` or the LAN IP, not `localhost`.
- **Buttons disappear** — a button entity goes unavailable if its routine is deleted from EduManage; the entity itself stays registered so automations don't break silently.
