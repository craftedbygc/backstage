import type {ISheet} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import {defaultScrollTriggerLabel} from '@unseenco/backstage-shared/gsap/scrollTriggerGuards'
import {registerOneGsapScrollTriggerOnSheet} from './registerGsapScrollTrigger'
import type {RegisterGsapScrollTriggerResult} from './registerGsapScrollTrigger'
import type {GsapScrollTriggerLike} from './gsapScrollTriggerTypes'
import {
  findScrollTriggerEntryByInstance,
  sheetAddressKey,
} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'
import {
  refreshGsapScrollTriggers,
  requireGsapScrollTriggerPlugin,
} from './gsapScrollTriggerPlugin'
import {scheduleGsapTickerRafWarningCheck} from './gsapTickerRafBridge'

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
  const sheetKey = sheetAddressKey(privateAPI(sheet).address)

  const registered: RegisterGsapScrollTriggerResult[] = []
  let skipped = 0

  all.forEach((st, index) => {
    const already = findScrollTriggerEntryByInstance(sheetKey, st)
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
    if (!result) {
      skipped += 1
    } else if (already) {
      skipped += 1
    } else {
      registered.push(result)
    }
  })

  scheduleGsapTickerRafWarningCheck()

  return {registered, skipped}
}
