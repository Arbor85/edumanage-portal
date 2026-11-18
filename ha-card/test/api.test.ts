import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listRoutines, listQueue, queueWorkout, deleteQueue } from '../src/api'
import { ApiError } from '../src/types'

const BASE = 'http://backend'
const KEY = 'secret'

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listRoutines sends X-Api-Key and parses JSON', async () => {
    const data = [{ id: 'r1', name: 'Legs' }]
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => data,
    })
    const result = await listRoutines(BASE, KEY)
    expect(result).toEqual(data)
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[0]).toBe(`${BASE}/api/routines`)
    expect(call[1].headers['X-Api-Key']).toBe(KEY)
  })

  it('throws ApiError with status on 401', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 401 })
    await expect(listQueue(BASE, KEY)).rejects.toMatchObject({ status: 401 })
  })

  it('throws ApiError with status 0 on network failure', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'))
    try {
      await listRoutines(BASE, KEY)
      throw new Error('expected throw')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(0)
    }
  })

  it('queueWorkout posts body with ha source', async () => {
    const out = { id: 'q1', routineId: 'r1', createdAt: 't', source: 'ha' }
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => out,
    })
    const result = await queueWorkout(BASE, KEY, 'r1')
    expect(result).toEqual(out)
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[1].method).toBe('POST')
    expect(JSON.parse(call[1].body)).toEqual({ routineId: 'r1', source: 'ha' })
  })

  it('deleteQueue issues DELETE and handles 204', async () => {
    ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 204 })
    await expect(deleteQueue(BASE, KEY, 'q1')).resolves.toBeUndefined()
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[0]).toBe(`${BASE}/api/workouts/queue/q1`)
    expect(call[1].method).toBe('DELETE')
  })
})
