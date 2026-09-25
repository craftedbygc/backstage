import {
  getActivePageScrollContext,
  setActivePageScrollContext,
} from './pageScrollContext'

describe('pageScrollContext cross-bundle store', () => {
  afterEach(() => {
    setActivePageScrollContext({scroller: null, axis: 'vertical'})
  })

  it('persists active context on globalThis for separate bundle copies', () => {
    setActivePageScrollContext({scroller: null, axis: 'horizontal'})
    expect(getActivePageScrollContext().axis).toBe('horizontal')
    const store = (
      globalThis as unknown as Record<
        string,
        {context: {axis?: string}} | undefined
      >
    )['__unseenco_backstage_active_page_scroll_context_v1__']
    expect(store?.context.axis).toBe('horizontal')
  })
})
