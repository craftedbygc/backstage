import type Project from '@unseenco/backstage/projects/Project'
import type {
  ProjectAhistoricState,
  ProjectState_Historic,
} from '@unseenco/backstage/projects/store/storeTypes'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type {ISheet} from '@unseenco/backstage/sheets/BackstageSheet'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {
  onPageScrollDrivenSequencePosition,
  syncPageScrollToSequencePosition,
} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import {
  getMaxScrollForPageScrollContext,
} from '@unseenco/backstage-shared/gsap/scrollTriggerLayout'
import {
  getActivePageScrollContext,
  resolvePageScrollAxis,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {resolveDomElementHighlightTarget} from '@unseenco/backstage-shared/gsap/domElementHighlightTarget'
import type {RemoteDomHighlightTarget} from '@unseenco/backstage-shared/gsap/domElementHighlightTarget'
import {setRemoteDomElementHighlight} from '@unseenco/backstage-shared/sheets/remoteDomElementHighlight'
import {setRemotePageScrollMetrics} from '@unseenco/backstage-shared/sheets/remotePageScrollMetrics'
import type {Studio} from '@unseenco/backstage/studio/Studio'
import {getCoreTicker} from '@unseenco/backstage/coreTicker'
import {pointerToPrism, val} from '@unseenco/backstage/dataverse'
import type {SerializableMap} from '@unseenco/backstage-shared/utils/types'
import {
  createDebouncedCallback,
  type DebouncedCallback,
} from './createDebouncedCallback'
import {
  isRemoteEditorWindow,
  parseRemoteEditorOpenerTabId,
} from '@unseenco/backstage-shared/remoteEditorWindow'
import {getBackstageWindowTabId} from '@unseenco/backstage-shared/utils/backstageWindowTabId'

/** Delay before pushing historic state from the remote editor to listener windows. */
export const REMOTE_HISTORIC_SYNC_DEBOUNCE_MS = 100

/** Bump when changing remote sync message shape or routing rules. */
export const REMOTE_SYNC_PROTOCOL_VERSION = 1

/**
 * When applying an incoming `updateTimeline` message, only the main (listener)
 * window should move page scroll; the remote editor only updates playhead position.
 */
export function shouldSyncPageScrollWhenApplyingTimelineUpdate(
  isEditor: boolean,
  sequenceMode: string,
): boolean {
  return !isEditor && sequenceMode === 'page'
}

type BroadcastDataEvent =
  | 'editorHello'
  | 'setSheet'
  | 'setSheetObject'
  | 'updateSheetObject'
  | 'updateTimeline'
  | 'pageScrollMetrics'
  | 'highlightDomTarget'
  | 'clearDomHighlight'
  | 'updateHistoric'
  | 'disconnect'

interface BroadcastData {
  protocolVersion: number
  senderId: string
  targetId?: string
  event: BroadcastDataEvent
  data: any
}

type HistoricSnapshotPayload = {
  historic?: ProjectState_Historic
  ahistoric?: ProjectAhistoricState
}

/**
 * Mirrors this project's sheet objects, selection, and sequence position
 * across browser windows/tabs over a per-project `BroadcastChannel`, so that
 * a "remote editor" window (see `isRemoteEditorWindow()`) can drive every
 * other window's `sheet.object(...)` values with no app code changes.
 *
 * Every `Project` owns exactly one of these. The `BroadcastChannel` is created
 * lazily when the project attaches to Studio (not in Node or before Studio loads).
 */
export default class RemoteSync {
  private readonly isEditor = isRemoteEditorWindow()
  private channel: BroadcastChannel | undefined
  private channelReady = false
  private readonly sheets = new Map<string, Sheet>()
  private readonly objects = new Map<string, SheetObject>()
  private readonly objectUnsubs = new Map<string, () => void>()
  private studio: Studio | undefined
  private activeSheet: Sheet | undefined
  private historicSyncDebounce: DebouncedCallback | undefined
  private lastBroadcastHistoricFingerprint: string | undefined
  private historicSyncUnsubs: Array<() => void> = []
  private remoteEditorActive = false
  private suppressTimelineBroadcast = false
  private listenerTimelineUnsub: (() => void) | undefined
  private listenerMetricsUnsubs: Array<() => void> = []
  private broadcastPageScrollMetrics: (() => void) | undefined
  private editorTimelinePositionUnsub: (() => void) | undefined
  private pagehideDisposer: (() => void) | undefined
  private disposed = false

  constructor(private readonly project: Project) {}

  private _ensureChannel(): BroadcastChannel | undefined {
    if (this.channelReady) return this.channel
    this.channelReady = true
    if (typeof BroadcastChannel === 'undefined') return undefined

    this.channel = new BroadcastChannel(
      `backstage-remote:${this.project.address.projectId}`,
    )

    this.channel.onmessage = (event: MessageEvent<BroadcastData>) => {
      this._handleIncoming(event.data)
    }

    if (!this.isEditor) {
      this.listenerTimelineUnsub = onPageScrollDrivenSequencePosition(
        (sheet, position) => {
          this._broadcastTimelineFromListener(sheet, position)
        },
      )
    }

    this.pagehideDisposer = () => {
      window.removeEventListener('pagehide', this._onPageHide)
    }
    window.addEventListener('pagehide', this._onPageHide)

    return this.channel
  }

  private readonly _onPageHide = () => {
    if (this.isEditor) {
      this.historicSyncDebounce?.flush()

      const data = this._readHistoricSnapshotFromStudio()
      if (
        data &&
        this.lastBroadcastHistoricFingerprint ===
          fingerprintHistoricSnapshot(data)
      ) {
        this._post('disconnect', {})
        return
      }

      this._post('disconnect', data ?? {})
    }
    this.dispose()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.pagehideDisposer?.()
    this.pagehideDisposer = undefined

    this.listenerTimelineUnsub?.()
    this.listenerTimelineUnsub = undefined

    for (const unsub of this.listenerMetricsUnsubs) {
      unsub()
    }
    this.listenerMetricsUnsubs = []

    for (const unsub of this.historicSyncUnsubs) {
      unsub()
    }
    this.historicSyncUnsubs = []

    this.historicSyncDebounce?.cancel?.()
    this.historicSyncDebounce = undefined

    this.editorTimelinePositionUnsub?.()
    this.editorTimelinePositionUnsub = undefined

    for (const unsub of this.objectUnsubs.values()) {
      unsub()
    }
    this.objectUnsubs.clear()

    this.channel?.close()
    this.channel = undefined
  }

  private _shouldHandleMessage(msg: BroadcastData): boolean {
    if (msg.protocolVersion !== REMOTE_SYNC_PROTOCOL_VERSION) {
      return false
    }
    const tabId = getBackstageWindowTabId()
    if (msg.targetId && msg.targetId !== tabId) {
      return false
    }
    return true
  }

  private _post(
    event: BroadcastDataEvent,
    data: unknown,
    targetId?: string,
  ): void {
    if (!this.channel) return
    const message: BroadcastData = {
      protocolVersion: REMOTE_SYNC_PROTOCOL_VERSION,
      senderId: getBackstageWindowTabId(),
      targetId,
      event,
      data,
    }
    this.channel.postMessage(message)
  }

  registerSheet(sheet: Sheet) {
    this.sheets.set(sheet.address.sheetId, sheet)
  }

  /**
   * Removes `sheet` from the sync map if it is the currently registered
   * instance for its `sheetId`. Returns whether it was removed.
   */
  unregisterSheet(sheet: Sheet): boolean {
    if (this.sheets.get(sheet.address.sheetId) !== sheet) {
      return false
    }
    this.sheets.delete(sheet.address.sheetId)
    if (this.activeSheet === sheet) {
      this.activeSheet = undefined
    }
    return true
  }

  registerObject(obj: SheetObject) {
    const id = `${obj.address.sheetId}_${obj.address.objectKey}`
    this.objects.set(id, obj)

    if (this.isEditor && this.channel) {
      this._attachEditorObjectBroadcast(obj)
    }
  }

  private _attachEditorObjectBroadcast(obj: SheetObject) {
    const channel = this.channel
    if (!channel) return
    const id = `${obj.address.sheetId}_${obj.address.objectKey}`
    if (this.objectUnsubs.has(id)) return

    const unsubscribe = obj.onFinalValueChange((values) => {
      this._post('updateSheetObject', {
        sheetObject: id,
        values: JSON.parse(JSON.stringify(values)),
      })
    })
    this.objectUnsubs.set(id, unsubscribe)
  }

  unregisterObject(obj: SheetObject) {
    const id = `${obj.address.sheetId}_${obj.address.objectKey}`
    this.objects.delete(id)
    const unsubscribe = this.objectUnsubs.get(id)
    if (unsubscribe) {
      unsubscribe()
      this.objectUnsubs.delete(id)
    }
  }

  attachStudio(studio: Studio) {
    this.studio = studio
    const channel = this._ensureChannel()
    if (!channel) return

    if (this.isEditor) {
      for (const obj of this.objects.values()) {
        this._attachEditorObjectBroadcast(obj)
      }
    }

    if (!this.isEditor) {
      this._attachListenerPageScrollMetricsBroadcast()
      return
    }

    const openerTabId = parseRemoteEditorOpenerTabId()
    this._post('editorHello', {}, openerTabId)
    const projectId = this.project.address.projectId

    studio.publicApi.onSelectionChange((selection) => {
      for (const item of selection) {
        if (item.address.projectId !== projectId) continue

        if (item.type === 'Backstage_Sheet_PublicAPI') {
          const sheet = this.sheets.get(item.address.sheetId)
          this.activeSheet = sheet
          this._attachEditorTimelinePositionSync()
          this._post('setSheet', {sheet: item.address.sheetId})
        } else if (item.type === 'Backstage_SheetObject_PublicAPI') {
          const sheet = this.sheets.get(item.address.sheetId)
          this.activeSheet = sheet
          this._attachEditorTimelinePositionSync()
          this._post('setSheetObject', {
            sheet: item.address.sheetId,
            key: item.address.objectKey,
          })
        }
      }
    })

    this._attachEditorTimelinePositionSync()

    this.historicSyncDebounce = createDebouncedCallback(() => {
      this._broadcastHistoricSnapshot()
    }, REMOTE_HISTORIC_SYNC_DEBOUNCE_MS)

    const scheduleHistoricSync = () => {
      this.historicSyncDebounce?.schedule()
    }

    void studio.initialized.then(() => {
      this.historicSyncUnsubs.push(
        pointerToPrism(studio.atomP.historic.coreByProject[projectId]).onChange(
          studio.ticker,
          scheduleHistoricSync,
          true,
        ),
        pointerToPrism(
          studio.atomP.ahistoric.coreByProject[projectId],
        ).onChange(studio.ticker, scheduleHistoricSync, true),
      )
    })
  }

  private _readHistoricSnapshotFromStudio():
    | HistoricSnapshotPayload
    | undefined {
    if (!this.studio) return undefined

    const projectId = this.project.address.projectId
    const historic = val(
      this.studio.atomP.historic.coreByProject[projectId],
    )
    if (!historic) return undefined

    const data: HistoricSnapshotPayload = {
      historic: JSON.parse(JSON.stringify(historic)),
    }
    const ahistoric = val(
      this.studio.atomP.ahistoric.coreByProject[projectId],
    )
    if (ahistoric) {
      data.ahistoric = JSON.parse(JSON.stringify(ahistoric))
    }
    return data
  }

  private _broadcastHistoricSnapshot(options?: {
    force?: boolean
    targetId?: string
  }) {
    if (!this.channel) return

    const data = this._readHistoricSnapshotFromStudio()
    if (!data) return

    const fingerprint = fingerprintHistoricSnapshot(data)
    if (
      !options?.force &&
      fingerprint === this.lastBroadcastHistoricFingerprint
    ) {
      return
    }

    this.lastBroadcastHistoricFingerprint = fingerprint
    this._post('updateHistoric', data, options?.targetId)
  }

  private _attachEditorTimelinePositionSync(): void {
    this.editorTimelinePositionUnsub?.()
    this.editorTimelinePositionUnsub = undefined

    const sheet = this.activeSheet
    if (!sheet || !this.isEditor) return

    const sequence = getEffectiveEditorSequence(sheet)
    let lastPosition: number | undefined
    this.editorTimelinePositionUnsub = pointerToPrism(
      sequence.pointer.position,
    ).onChange(
      getCoreTicker(),
      (position) => {
        if (this.suppressTimelineBroadcast) return
        if (position === lastPosition) return
        lastPosition = position
        this._post('updateTimeline', {
          sheet: sheet.address.sheetId,
          position,
        })
      },
      false,
    )
  }

  private _applyHistoricSnapshot(
    historic: ProjectState_Historic,
    ahistoric?: ProjectAhistoricState,
  ) {
    if (!this.studio) return

    const projectId = this.project.address.projectId
    this.studio.transaction(({drafts}) => {
      drafts.historic.coreByProject[projectId] = historic
      if (ahistoric) {
        drafts.ahistoric.coreByProject[projectId] = ahistoric
      }
      drafts.ephemeral.coreByProject[projectId]!.loadingState = {
        type: 'loaded',
      }
    })
  }

  private _broadcastTimelineFromListener(sheet: ISheet, position: number) {
    if (
      this.isEditor ||
      !this.channel ||
      !this.remoteEditorActive ||
      this.suppressTimelineBroadcast
    ) {
      return
    }
    const registered = this.sheets.get(sheet.address.sheetId)
    if (!registered || registered.getSequenceMode() !== 'page') return

    this._post('updateTimeline', {sheet: sheet.address.sheetId, position})
  }

  private _postPageScrollMetrics() {
    if (!this.remoteEditorActive || !this.channel) return
    const ctx = getActivePageScrollContext()
    const axis = resolvePageScrollAxis(ctx)
    const maxScroll = getMaxScrollForPageScrollContext(ctx.scroller, axis)
    this._post('pageScrollMetrics', {maxScroll, axis})
  }

  private _attachListenerPageScrollMetricsBroadcast() {
    if (this.isEditor || !this.channel) return

    const broadcast = () => this._postPageScrollMetrics()
    this.broadcastPageScrollMetrics = broadcast

    const onScroll = () => broadcast()
    document.addEventListener('scroll', onScroll, {passive: true, capture: true})
    const onResize = () => broadcast()
    window.addEventListener('resize', onResize)

    const ScrollTrigger = (
      globalThis as typeof globalThis & {
        ScrollTrigger?: {
          addEventListener?: (type: string, cb: () => void) => void
          removeEventListener?: (type: string, cb: () => void) => void
        }
      }
    ).ScrollTrigger
    ScrollTrigger?.addEventListener?.('refresh', broadcast)

    broadcast()

    this.listenerMetricsUnsubs.push(() => {
      document.removeEventListener('scroll', onScroll, {capture: true})
      window.removeEventListener('resize', onResize)
      ScrollTrigger?.removeEventListener?.('refresh', broadcast)
    })
  }

  private _handleIncoming(msg: BroadcastData) {
    if (!this._shouldHandleMessage(msg)) {
      return
    }

    switch (msg.event) {
      case 'editorHello': {
        if (this.isEditor) break
        this.remoteEditorActive = true
        this.broadcastPageScrollMetrics?.()
        // Bootstrap remote Studio from main's project state (no duplicate DOM/GSAP).
        this._broadcastHistoricSnapshot({
          force: true,
          targetId: msg.senderId,
        })
        break
      }
      case 'setSheet': {
        const sheet = this.sheets.get(msg.data.sheet)
        if (sheet && this.studio) {
          this.activeSheet = sheet
          this.studio.publicApi.setSelection([sheet.publicApi])
        }
        break
      }
      case 'setSheetObject': {
        const obj = this.objects.get(`${msg.data.sheet}_${msg.data.key}`)
        if (obj && this.studio) {
          this.studio.publicApi.setSelection([obj.publicApi])
        }
        break
      }
      case 'updateSheetObject': {
        const obj = this.objects.get(msg.data.sheetObject)
        if (obj) obj.setRemoteOverride(msg.data.values as SerializableMap)
        break
      }
      case 'updateTimeline': {
        const sheet = this.sheets.get(msg.data.sheet)
        if (sheet) {
          this.activeSheet = sheet
          this.suppressTimelineBroadcast = true
          sheet.publicApi.sequence.position = msg.data.position
          // Main window scroll drives the remote playhead; only the listener
          // window should move page scroll when applying a remote scrub.
          if (
            shouldSyncPageScrollWhenApplyingTimelineUpdate(
              this.isEditor,
              sheet.getSequenceMode(),
            )
          ) {
            syncPageScrollToSequencePosition(sheet.publicApi)
          }
          requestAnimationFrame(() => {
            this.suppressTimelineBroadcast = false
          })
        }
        break
      }
      case 'pageScrollMetrics': {
        if (!this.isEditor) break
        const {maxScroll, axis} = msg.data as {
          maxScroll: number
          axis: 'vertical' | 'horizontal'
        }
        setRemotePageScrollMetrics({maxScroll, axis})
        break
      }
      case 'highlightDomTarget': {
        if (this.isEditor || !this.remoteEditorActive) break
        const target = msg.data.target as RemoteDomHighlightTarget
        const element = resolveDomElementHighlightTarget(target)
        setRemoteDomElementHighlight(element)
        break
      }
      case 'clearDomHighlight': {
        if (this.isEditor || !this.remoteEditorActive) break
        setRemoteDomElementHighlight(null)
        break
      }
      case 'updateHistoric': {
        const {historic, ahistoric} = msg.data as HistoricSnapshotPayload
        if (historic) {
          this._applyHistoricSnapshot(historic, ahistoric)
        }
        break
      }
      case 'disconnect': {
        const {historic, ahistoric} = msg.data as HistoricSnapshotPayload
        if (historic) {
          this._applyHistoricSnapshot(historic, ahistoric)
        }
        for (const obj of this.objects.values()) {
          obj.setRemoteOverride({})
        }
        if (!this.isEditor) {
          this.remoteEditorActive = false
          setRemoteDomElementHighlight(null)
        } else {
          setRemotePageScrollMetrics(undefined)
        }
        break
      }
    }
  }
}

function fingerprintHistoricSnapshot(data: HistoricSnapshotPayload): string {
  return JSON.stringify(data)
}

function getEffectiveEditorSequence(sheet: Sheet) {
  const variant = val(sheet.effectiveActiveSequenceVariantD)
  return sheet.getSequence(variant).publicApi
}
