import type { RefObject } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useObserverInfiniteScroll from './useObserverInfiniteScroll'

type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void

function refOf<T extends HTMLElement>(element: T | null): RefObject<T | null> {
  return { current: element }
}

describe('useObserverInfiniteScroll', () => {
  let observerCallback: IntersectionObserverCallback | null = null
  const observe = vi.fn()
  const unobserve = vi.fn()
  let lastOptions: IntersectionObserverInit | undefined

  beforeEach(() => {
    observerCallback = null
    lastOptions = undefined
    observe.mockClear()
    unobserve.mockClear()

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(
          cb: IntersectionObserverCallback,
          options?: IntersectionObserverInit,
        ) {
          observerCallback = cb
          lastOptions = options
        }

        observe = observe
        unobserve = unobserve
        disconnect = vi.fn()
        takeRecords = vi.fn(() => [])
        root = null
        rootMargin = ''
        thresholds = []
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('observes the trigger element with defaults', () => {
    const trigger = document.createElement('div')

    renderHook(() =>
      useObserverInfiniteScroll({
        triggerRef: refOf(trigger),
        callBack: vi.fn(),
      }),
    )

    expect(observe).toHaveBeenCalledWith(trigger)
    expect(lastOptions).toMatchObject({
      root: null,
      rootMargin: '100px 0px',
      threshold: 1.0,
    })
  })

  it('calls callback when the trigger intersects', async () => {
    const callBack = vi.fn()
    const trigger = document.createElement('div')

    renderHook(() =>
      useObserverInfiniteScroll({
        triggerRef: refOf(trigger),
        callBack,
      }),
    )

    const entry = { isIntersecting: true } as IntersectionObserverEntry

    await act(async () => {
      await observerCallback?.([entry], {} as IntersectionObserver)
    })

    expect(callBack).toHaveBeenCalledTimes(1)
    expect(callBack).toHaveBeenCalledWith(entry)
  })

  it('does not call callback when not intersecting', async () => {
    const callBack = vi.fn()

    renderHook(() =>
      useObserverInfiniteScroll({
        triggerRef: refOf(document.createElement('div')),
        callBack,
      }),
    )

    await act(async () => {
      await observerCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(callBack).not.toHaveBeenCalled()
  })

  it('unobserves on unmount', () => {
    const trigger = document.createElement('div')

    const { unmount } = renderHook(() =>
      useObserverInfiniteScroll({
        triggerRef: refOf(trigger),
        callBack: vi.fn(),
      }),
    )

    unmount()

    expect(unobserve).toHaveBeenCalledWith(trigger)
  })

  it('does not create an observer without a callback', () => {
    renderHook(() =>
      useObserverInfiniteScroll({
        triggerRef: refOf(document.createElement('div')),
      }),
    )

    expect(observe).not.toHaveBeenCalled()
  })
})
