import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useAutoId from './useAutoId'

describe('useAutoId', () => {
  it('returns the provided id when given', () => {
    const { result } = renderHook(() => useAutoId('custom-id'))

    expect(result.current).toBe('custom-id')
  })

  it('falls back to a generated id when none is provided', () => {
    const { result } = renderHook(() => useAutoId())

    expect(typeof result.current).toBe('string')
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('keeps a stable generated id across rerenders', () => {
    const { result, rerender } = renderHook(() => useAutoId())

    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})
