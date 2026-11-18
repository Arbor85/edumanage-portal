# EduManage — Home Assistant Card

A Lovelace custom card that lists your EduManage routines and lets you queue one. The next time you open the EduManage web app, the queued routine auto-starts.

> Looking for a full HA integration (entities + services + automations)? See [Arbor85/edumanage-ha-integration](https://github.com/Arbor85/edumanage-ha-integration) — install via HACS as an *Integration*.

## Prerequisites

- A running EduManage backend reachable from your Home Assistant instance.
- An EduManage API key — create one via the app at **Settings → MCP API Keys**.

## Install via HACS (recommended)

HACS pulls the built `edumanage-card.js` from a GitHub **Release** of this repo — it doesn't build from source or scan the `ha-card/` subdirectory.

1. In Home Assistant, open **HACS → Frontend**.
2. Click the **⋮** menu (top right) → **Custom repositories**.
3. Add the repo URL (`https://github.com/<owner>/edumanage-portal`), category **Dashboard**, then **Add**.
4. Find **EduManage Card** in the HACS Frontend list → **Download** → pick the latest release.
5. Reload the browser when prompted. HACS auto-registers the resource at `/hacsfiles/EduManage-Card/edumanage-card.js`.
6. Jump to **Configure the card** below.

> If HACS reports *"has no content the Marketplace can install"*, no tagged release with `edumanage-card.js` as an asset exists yet. Push a `ha-card-v*` tag — the `Release HA Card` workflow builds the bundle and attaches it.

## Install manually

```bash
cd ha-card
npm install
npm run build
```

Copy the built bundle into Home Assistant:

```
cp dist/edumanage-card.js <ha-config>/www/community/edumanage/edumanage-card.js
```

## Configure the card (UI only, no file edits)

1. **Settings → Dashboards → Resources** → add `/local/community/edumanage/edumanage-card.js` as a *JavaScript Module* (manual install only — HACS does this for you).
2. Open any dashboard → **Edit dashboard → Add Card → EduManage**.
3. Fill in the form:
   - **API base URL** — e.g. `http://192.168.1.10:5090`
   - **API key** — paste the key from EduManage → Settings → MCP API Keys
   - **Title** (optional) — defaults to *Workouts*
   - **Poll interval** (optional) — 10–600 seconds, defaults to 30
4. **Save**. That's it — no `secrets.yaml`, no YAML editing.

> Advanced: if you prefer YAML, the equivalent config is `type: custom:edumanage-card`, `api_base_url: ...`, `api_key: ...`, with optional `title` and `poll_interval`. You can also reference `!secret edumanage_api_key` if you want the key kept out of the dashboard storage.

## How "Start" works

Tapping **Start** posts the routine id to `/api/workouts/queue`. The EduManage web app polls this queue on open — if an entry is waiting (and you aren't mid-workout), it auto-starts that routine and clears the entry.

## Troubleshooting

- **"Invalid API key"** — rotate the key in EduManage and update it in the card editor.
- **CORS error in browser console** — add your HA origin to `Cors:AllowedOrigins` in the backend `appsettings.json`.
- **Nothing happens when you open EduManage** — check that the current workout is nil; queued entries are deferred while a workout is in progress.

## Security

The API key you paste in the editor is stored inside the dashboard's Lovelace config on the HA host (same place all other card config lives). Anyone with HA admin access can read it. The key grants user-scoped access to your EduManage data except API-key management (which requires a JWT session). Rotate the key from EduManage → Settings → MCP API Keys whenever needed.
