import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useThrottleCallback from './useThrottleCallback'

describe('useThrottleCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes immediately on the leading edge by default', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottleCallback(callback, 200))

    act(() => {
      result.current('a')
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('a')
    expect(result.current.isPending()).toBe(false)
  })

  it('does not invoke again within the delay window (leading only once)', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useThrottleCallback(callback, 200, { trailing: false }),
    )

    act(() => {
      result.current(1)
      result.current(2)
      result.current(3)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(1)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('invokes trailing call with the last args after the window', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottleCallback(callback, 200))

    act(() => {
      result.current('first')
      result.current('second')
      result.current('third')
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
    expect(result.current.isPending()).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith('third')
    expect(result.current.isPending()).toBe(false)
  })

  it('supports leading: false (no immediate call, only trailing)', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useThrottleCallback(callback, 200, { leading: false }),
    )

    act(() => {
      result.current('a')
      result.current('b')
    })

    expect(callback).not.toHaveBeenCalled()
    expect(result.current.isPending()).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('b')
  })

  it('allows another leading call after the delay when trailing is false', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useThrottleCallback(callback, 200, { trailing: false }),
    )

    act(() => {
      result.current(1)
    })

    act(() => {
      vi.advanceTimersByTime(200)
      result.current(2)
    })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 1)
    expect(callback).toHaveBeenNthCalledWith(2, 2)
  })

  it('flush runs pending trailing args immediately', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottleCallback(callback, 200))

    act(() => {
      result.current('a')
      result.current('b')
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.flush()
    })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith('b')
    expect(result.current.isPending()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('flush is a no-op after a lone leading invoke', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottleCallback(callback, 200))

    act(() => {
      result.current('only')
      result.current.flush()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('cancel clears a pending trailing call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottleCallback(callback, 200))

    act(() => {
      result.current('a')
      result.current('b')
      result.current.cancel()
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(result.current.isPending()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('after cancel with leading: false, the next series does not fire immediately', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useThrottleCallback(callback, 200, { leading: false }),
    )

    act(() => {
      result.current('a')
      result.current.cancel()
      result.current('b')
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('b')
  })

  it('uses the latest callback via ref', () => {
    const first = vi.fn()
    const second = vi.fn()

    const { result, rerender } = renderHook(
      ({ cb }) => useThrottleCallback(cb, 200, { trailing: false }),
      { initialProps: { cb: first } },
    )

    rerender({ cb: second })

    act(() => {
      result.current('x')
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('x')
  })
})
