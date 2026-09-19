import type {ISheet} from '@unseenco/theatre-core'
import {defaultScrollTriggerLabel} from '@unseenco/theatre-shared/gsap/scrollTriggerGuards'
import {registerOneGsapScrollTriggerOnSheet} from './registerGsapScrollTrigger'
import type {RegisterGsapScrollTriggerResult} from './registerGsapScrollTrigger'
import type {GsapScrollTriggerLike} from './gsapScrollTriggerTypes'
import {
  refreshGsapScrollTriggers,
  requireGsapScrollTriggerPlugin,
} from './gsapScrollTriggerPlugin'

export type RegisterAllGsapScrollTriggersResult = {
  registered: RegisterGsapScrollTriggerResult[]
  skipped: number
}

/**
 * Registers every document-vertical ScrollTrigger from `ScrollTrigger.getAll()`.
 */
export function registerAllGsapScrollTriggers(
  sheet: ISheet,
): RegisterAllGsapScrollTriggersResult {
  if (sheet.getSequenceMode() !== 'page') {
    throw new Error(
      'registerAllGsapScrollTriggers() requires the sheet to use sequenceMode "page".',
    )
  }

  const ScrollTrigger = requireGsapScrollTriggerPlugin()
  refreshGsapScrollTriggers()
  const all = ScrollTrigger.getAll()

  const registered: RegisterGsapScrollTriggerResult[] = []
  let skipped = 0

  all.forEach((st, index) => {
    const label = defaultScrollTriggerLabel(st, index)
    const id =
      typeof st.vars?.id === 'string' && st.vars.id.length > 0
        ? st.vars.id
        : undefined
    const result = registerOneGsapScrollTriggerOnSheet(
      sheet,
      st as GsapScrollTriggerLike,
      {label, id},
      index,
    )
    if (result) {
      registered.push(result)
    } else {
      skipped += 1
    }
  })

  return {registered, skipped}
}
