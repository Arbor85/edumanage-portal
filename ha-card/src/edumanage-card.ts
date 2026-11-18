import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { cardStyles } from './styles'
import { CardConfig, NormalizedCardConfig, QueuedWorkoutOut, RoutineTile, normalizeConfig, ApiError } from './types'
import { deleteQueue, listQueue, listRoutines, queueWorkout } from './api'
import './edumanage-card-editor'

@customElement('edumanage-card')
export class EdumanageCard extends LitElement {
  static styles = cardStyles

  static async getConfigElement() {
    return document.createElement('edumanage-card-editor')
  }

  static getStubConfig(): CardConfig {
    return {
      type: 'custom:edumanage-card',
      api_base_url: '',
      api_key: '',
    }
  }

  @state() private _config?: NormalizedCardConfig
  @state() private _configError: string | null = null
  @state() private _routines: RoutineTile[] = []
  @state() private _queue: QueuedWorkoutOut[] = []
  @state() private _loading = true
  @state() private _error: string | null = null
  @state() private _pendingRoutineId: string | null = null

  private _timer: ReturnType<typeof setInterval> | null = null

  setConfig(config: CardConfig) {
    try {
      this._config = normalizeConfig(config)
      this._configError = null
    } catch (err) {
      this._config = undefined
      this._configError = (err as Error).message
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this._refresh()
    if (this._config) {
      this._timer = setInterval(() => this._refresh(), this._config.pollInterval * 1000)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._timer) clearInterval(this._timer)
    this._timer = null
  }

  private async _refresh() {
    if (!this._config) return
    try {
      const [routines, queue] = await Promise.all([
        listRoutines(this._config.apiBaseUrl, this._config.apiKey),
        listQueue(this._config.apiBaseUrl, this._config.apiKey),
      ])
      this._routines = routines
      this._queue = queue
      this._error = null
    } catch (err) {
      const apiErr = err as ApiError
      this._error = apiErr.status === 401
        ? 'Invalid API key. Check the card configuration.'
        : `Failed to load (${apiErr.status || 'network error'}).`
      if (apiErr.status === 401 && this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    } finally {
      this._loading = false
    }
  }

  private async _onStart(routineId: string) {
    if (!this._config || this._pendingRoutineId) return
    this._pendingRoutineId = routineId
    try {
      await queueWorkout(this._config.apiBaseUrl, this._config.apiKey, routineId)
      await this._refresh()
    } catch (err) {
      const apiErr = err as ApiError
      this._fireNotification(`Failed to queue workout (${apiErr.status || 'network'}).`)
    } finally {
      this._pendingRoutineId = null
    }
  }

  private async _onCancel(id: string) {
    if (!this._config) return
    try {
      await deleteQueue(this._config.apiBaseUrl, this._config.apiKey, id)
      await this._refresh()
    } catch {
      this._fireNotification('Failed to cancel queued workout.')
    }
  }

  private _fireNotification(message: string) {
    this.dispatchEvent(new CustomEvent('hass-notification', { bubbles: true, composed: true, detail: { message } }))
  }

  render() {
    if (!this._config) {
      return html`
        <ha-card>
          <div class="header"><span class="title">EduManage</span></div>
          <div class="empty">
            ${this._configError ?? 'Open the card editor to set the API URL and key.'}
          </div>
        </ha-card>
      `
    }
    const queued = this._queue[0]
    const queuedRoutine = queued ? this._routines.find((r) => r.id === queued.routineId) : undefined
    return html`
      <ha-card>
        <div class="header">
          <span class="title">${this._config.title}</span>
          <button class="refresh" @click=${() => this._refresh()} aria-label="Refresh">↻</button>
        </div>

        ${queued
          ? html`
              <div class="banner">
                <span>Queued: ${queuedRoutine?.name ?? 'routine will start on next app open'}</span>
                <button class="banner-cancel" @click=${() => this._onCancel(queued.id)}>Cancel</button>
              </div>
            `
          : nothing}

        ${this._error
          ? html`<div class="error">${this._error}</div>`
          : this._loading
            ? html`
                <div class="list">
                  <div class="skeleton"></div>
                  <div class="skeleton"></div>
                  <div class="skeleton"></div>
                </div>
              `
            : this._routines.length === 0
              ? html`<div class="empty">No routines yet. Create one in EduManage.</div>`
              : html`
                  <div class="list">
                    ${this._routines.map(
                      (routine) => html`
                        <div class="row">
                          <div>
                            <div class="row-name">${routine.name}</div>
                            <div class="row-meta">${routine.excercises?.length ?? 0} exercises</div>
                          </div>
                          <button
                            class="start"
                            ?disabled=${this._pendingRoutineId === routine.id}
                            @click=${() => this._onStart(routine.id)}
                          >
                            ${this._pendingRoutineId === routine.id ? 'Queuing…' : 'Start'}
                          </button>
                        </div>
                      `,
                    )}
                  </div>
                `}
      </ha-card>
    `
  }
}

interface CustomCardEntry {
  type: string
  name: string
  description: string
}
const w = window as unknown as { customCards?: CustomCardEntry[] }
w.customCards = [
  ...(w.customCards ?? []),
  {
    type: 'edumanage-card',
    name: 'EduManage',
    description: 'List and queue EduManage routines.',
  },
]
