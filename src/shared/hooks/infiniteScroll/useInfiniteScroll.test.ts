import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import useInfiniteScroll from './useInfiniteScroll'

function mockScrollMetrics(scrollHeight: number, scrollTop: number, innerHeight: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  })
  Object.defineProperty(document.documentElement, 'scrollTop', {
    configurable: true,
    value: scrollTop,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: innerHeight,
  })
}

describe('useInfiniteScroll', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls callback when scrolled near the bottom', () => {
    const callBack = vi.fn()

    renderHook(() =>
      useInfiniteScroll({
        callBack,
        distanceToBottom: 100,
      }),
    )

    // distance to bottom = 1000 - (800 + 150) = 50 < 100
    mockScrollMetrics(1000, 150, 800)

    act(() => {
      document.dispatchEvent(new Event('scroll'))
    })

    expect(callBack).toHaveBeenCalledTimes(1)
  })

  it('does not call callback when far from the bottom', () => {
    const callBack = vi.fn()

    renderHook(() =>
      useInfiniteScroll({
        callBack,
        distanceToBottom: 100,
      }),
    )

    // distance to bottom = 1000 - (500 + 0) = 500 >= 100
    mockScrollMetrics(1000, 0, 500)

    act(() => {
      document.dispatchEvent(new Event('scroll'))
    })

    expect(callBack).not.toHaveBeenCalled()
  })

  it('removes the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        callBack: vi.fn(),
      }),
    )

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
