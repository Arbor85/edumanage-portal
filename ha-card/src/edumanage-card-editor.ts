import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { CardConfig } from './types'

@customElement('edumanage-card-editor')
export class EdumanageCardEditor extends LitElement {
  @state() private _config: Partial<CardConfig> = {}

  static styles = css`
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 0.9em;
      color: var(--secondary-text-color);
      gap: 4px;
    }
    input {
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 1em;
    }
    input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .hint {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
  `

  setConfig(config: Partial<CardConfig>) {
    this._config = { ...config }
  }

  private _emit(patch: Partial<CardConfig>) {
    this._config = { ...this._config, ...patch }
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: { type: 'custom:edumanage-card', ...this._config } },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _onInput(key: keyof CardConfig, ev: Event) {
    const target = ev.target as HTMLInputElement
    if (key === 'poll_interval') {
      const n = Number(target.value)
      this._emit({ poll_interval: Number.isFinite(n) && n > 0 ? n : undefined })
    } else {
      this._emit({ [key]: target.value } as Partial<CardConfig>)
    }
  }

  render() {
    return html`
      <div class="form">
        <label>
          API base URL *
          <input
            type="url"
            placeholder="http://192.168.1.10:5090"
            .value=${this._config.api_base_url ?? ''}
            @input=${(e: Event) => this._onInput('api_base_url', e)}
          />
          <span class="hint">URL where your EduManage backend is reachable from Home Assistant.</span>
        </label>

        <label>
          API key *
          <input
            type="password"
            placeholder="emk_..."
            .value=${this._config.api_key ?? ''}
            @input=${(e: Event) => this._onInput('api_key', e)}
          />
          <span class="hint">Create one in EduManage → Settings → MCP API Keys.</span>
        </label>

        <label>
          Title
          <input
            type="text"
            placeholder="Workouts"
            .value=${this._config.title ?? ''}
            @input=${(e: Event) => this._onInput('title', e)}
          />
        </label>

        <label>
          Poll interval (seconds)
          <input
            type="number"
            min="10"
            max="600"
            placeholder="30"
            .value=${this._config.poll_interval?.toString() ?? ''}
            @input=${(e: Event) => this._onInput('poll_interval', e)}
          />
          <span class="hint">Between 10 and 600 seconds. Defaults to 30.</span>
        </label>
      </div>
    `
  }
}
