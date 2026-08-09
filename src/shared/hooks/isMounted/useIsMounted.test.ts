import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useIsMounted from './useIsMounted'

describe('useIsMounted', () => {
  it('returns true after mount', () => {
    const { result } = renderHook(() => useIsMounted())

    expect(result.current()).toBe(true)
  })

  it('returns false after unmount', () => {
    const { result, unmount } = renderHook(() => useIsMounted())
    const isMounted = result.current

    unmount()

    expect(isMounted()).toBe(false)
  })

  it('returns a stable function identity', () => {
    const { result, rerender } = renderHook(() => useIsMounted())

    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})
