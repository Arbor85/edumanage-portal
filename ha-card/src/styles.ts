import { css } from 'lit'

export const cardStyles = css`
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: var(--ha-card-header-font-size, 1.2em);
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .refresh {
    background: transparent;
    border: none;
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .refresh:hover {
    background: var(--secondary-background-color);
  }
  .banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--primary-color) 15%, transparent);
    color: var(--primary-text-color);
    font-size: 0.9em;
  }
  .banner-cancel {
    background: transparent;
    border: 1px solid var(--divider-color);
    color: var(--primary-text-color);
    padding: 2px 10px;
    border-radius: 6px;
    cursor: pointer;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--secondary-background-color);
  }
  .row-name {
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .row-meta {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }
  .start {
    background: var(--primary-color);
    color: var(--text-primary-color, white);
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }
  .start:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .skeleton {
    height: 44px;
    border-radius: 8px;
    background: var(--secondary-background-color);
    opacity: 0.6;
  }
  .error,
  .empty {
    color: var(--secondary-text-color);
    font-size: 0.9em;
    text-align: center;
    padding: 12px 4px;
  }
  .error {
    color: var(--error-color, #c62828);
  }
`
