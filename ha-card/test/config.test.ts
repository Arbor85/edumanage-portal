import { describe, it, expect } from 'vitest'
import { normalizeConfig } from '../src/types'

describe('normalizeConfig', () => {
  const base = {
    type: 'custom:edumanage-card' as const,
    api_base_url: 'http://localhost:5090',
    api_key: 'test-key',
  }

  it('accepts a valid config and applies defaults', () => {
    const c = normalizeConfig(base)
    expect(c.apiBaseUrl).toBe('http://localhost:5090')
    expect(c.apiKey).toBe('test-key')
    expect(c.title).toBe('Workouts')
    expect(c.pollInterval).toBe(30)
  })

  it('strips trailing slashes on api_base_url', () => {
    expect(normalizeConfig({ ...base, api_base_url: 'http://localhost:5090///' }).apiBaseUrl)
      .toBe('http://localhost:5090')
  })

  it('throws when api_base_url is missing', () => {
    expect(() => normalizeConfig({ ...base, api_base_url: '' })).toThrow(/api_base_url/)
  })

  it('throws when api_key is missing', () => {
    expect(() => normalizeConfig({ ...base, api_key: '' })).toThrow(/api_key/)
  })

  it('clamps poll_interval to [10, 600]', () => {
    expect(normalizeConfig({ ...base, poll_interval: 1 }).pollInterval).toBe(10)
    expect(normalizeConfig({ ...base, poll_interval: 9999 }).pollInterval).toBe(600)
    expect(normalizeConfig({ ...base, poll_interval: 60 }).pollInterval).toBe(60)
  })

  it('uses provided title', () => {
    expect(normalizeConfig({ ...base, title: 'Lift' }).title).toBe('Lift')
  })
})
