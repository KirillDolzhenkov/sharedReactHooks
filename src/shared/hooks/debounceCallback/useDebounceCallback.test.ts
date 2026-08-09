import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useDebounceCallback from './useDebounceCallback'

describe('useDebounceCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays invocation until after the delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(callback, 300))

    act(() => {
      result.current('a')
    })

    expect(callback).not.toHaveBeenCalled()
    expect(result.current.isPending()).toBe(true)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('a')
    expect(result.current.isPending()).toBe(false)
  })

  it('resets the timer on rapid calls and keeps the last args', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(callback, 300))

    act(() => {
      result.current('a')
      vi.advanceTimersByTime(200)
      result.current('b')
      vi.advanceTimersByTime(200)
      result.current('c')
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('c')
  })

  it('cancel prevents a pending call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(callback, 300))

    act(() => {
      result.current('a')
      result.current.cancel()
    })

    expect(result.current.isPending()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('flush runs the pending call immediately', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(callback, 300))

    act(() => {
      result.current('a')
      result.current.flush()
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('a')
    expect(result.current.isPending()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('uses the latest callback via ref', () => {
    const first = vi.fn()
    const second = vi.fn()

    const { result, rerender } = renderHook(
      ({ cb }) => useDebounceCallback(cb, 300),
      { initialProps: { cb: first } },
    )

    rerender({ cb: second })

    act(() => {
      result.current('x')
      vi.advanceTimersByTime(300)
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('x')
  })
})
