import type {
  PropTypeConfig,
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
} from '@unseenco/theatre-core/propTypes'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {IPropPathToTrackIdTree} from '@unseenco/theatre-core/sheetObjects/SheetObjectTemplate'
import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import type {
  PathToProp,
  SheetAddress,
} from '@unseenco/theatre-shared/utils/addresses'
import type {
  SequenceTrackId,
  StudioSheetItemKey,
} from '@unseenco/theatre-shared/utils/ids'
import {createStudioSheetItemKey} from '@unseenco/theatre-shared/utils/ids'
import type {
  $FixMe,
  $IntentionalAny,
} from '@unseenco/theatre-shared/utils/types'
import {prism, val, pointerToPrism} from '@unseenco/theatre-dataverse'
import logger from '@unseenco/theatre-shared/logger'
import {titleBarHeight} from '@unseenco/theatre-studio/panels/BasePanel/common'
import {transportStripHeight} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/PlaybackControls/constants'
import type {Studio} from '@unseenco/theatre-studio/Studio'
import type {UnknownValidCompoundProps} from '@unseenco/theatre-core/propTypes/internals'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {DEFAULT_SEQUENCE_VARIANT} from '@unseenco/theatre-studio/utils/sequenceVariantHelpers'
import {isSheetPropsObjectKey} from '@unseenco/theatre-shared/utils/sheetProps'
import type {
  GsapClipTrack,
  SheetState_Historic,
} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {getSequenceStateFromSheet} from '@unseenco/theatre-studio/utils/sequenceVariantHelpers'
import {isGsapClipTrack} from '@unseenco/theatre-shared/sequence/trackData'
import {isGsapSheetObjectKey} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import {isGsapScrollTriggerSheetObjectKey} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import {getAnimationEntryForSheetObject} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {gsapStudioRegistryRevisionPointer} from '@unseenco/theatre-shared/gsap/gsapStudioRegistryRevision'
import {scrollTriggerChildInSequenceSpace} from '@unseenco/theatre-shared/gsap/extractScrollTriggerLayout'
import {
  isRegisteredScrollTriggerSheetObject,
  listScrollTriggerEntriesForSheet,
  sheetAddressKey,
} from '@unseenco/theatre-shared/gsap/scrollTriggerRegistry'
import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {NamespacedObjects} from '@unseenco/theatre-studio/panels/OutlinePanel/outlinePanelUtils'
import {buildSequenceEditorNamespaceMap} from './sequenceEditorObjectNamespaces'

/**
 * Base "view model" for each row with common
 * required information such as row heights & depth.
 */
export type SequenceEditorTree_Row<TypeName extends string> = {
  /** type of this row, e.g. `"sheet"` or `"sheetObject"` */
  type: TypeName
  /** Height of just the row in pixels */
  nodeHeight: number
  /** Height of the row + height with children in pixels */
  heightIncludingChildren: number

  /** Visual indentation */
  depth: number
  /** A convenient studio sheet localized identifier for managing presence and ephemeral visual effects. */
  sheetItemKey: StudioSheetItemKey
  /**
   * This is a part of the tree, but it is not rendered at all,
   * and it doesn't contribute to height.
   *
   * In the future, if we have a filtering mechanism like "show only position props",
   * this would not be the place to make false, that node should just not be included
   * in the tree at all, so it doesn't affect aggregate keyframes.
   */
  shouldRender: boolean
  /**
   * Distance in pixels from the top of this row to the row container's top
   * This can be used to help figure out what's being box selected (marquee).
   */
  top: number
  /** Row number (e.g. for correctly styling even / odd alternating styles) */
  n: number
}

export type SequenceEditorTree = SequenceEditorTree_Sheet

export type SequenceEditorTree_SheetChild =
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_ObjectNamespace

export type SequenceEditorTree_Sheet = SequenceEditorTree_Row<'sheet'> & {
  sheet: Sheet
  isCollapsed: boolean
  children: SequenceEditorTree_SheetChild[]
}

export type SequenceEditorTree_ObjectNamespace =
  SequenceEditorTree_Row<'objectNamespace'> & {
    isCollapsed: boolean
    label: string
    sheetAddress: SheetAddress
    /** Path from the sheet root to this folder (inclusive). */
    namespacePath: string[]
    children: SequenceEditorTree_SheetChild[]
  }

export type SequenceEditorTree_SheetObjectInlineGsapClip = {
  trackId: SequenceTrackId
  trackData: GsapClipTrack
  displayLabel: string
  isCollapsed: boolean
}

export type SequenceEditorTree_SheetObjectInlineGsapScrollTrigger = {
  scrollTriggerId: string
  layout: {start: number; duration: number}
  kind: 'tween' | 'timeline'
  animationSpanSeconds: number
  displayLabel: string
  isCollapsed: boolean
}

export type SequenceEditorTree_SheetObject =
  SequenceEditorTree_Row<'sheetObject'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    /** When set, used instead of `objectKey` in the sequence editor left column. */
    displayLabel?: string
    /**
     * GSAP proxy objects show their parent clip bar on this row instead of a nested
     * `gsapClipTrack` row with a duplicate label.
     */
    gsapClip?: SequenceEditorTree_SheetObjectInlineGsapClip
    /**
     * ScrollTrigger proxies show a read-only bar on this row (same pattern as GSAP clips).
     */
    gsapScrollTrigger?: SequenceEditorTree_SheetObjectInlineGsapScrollTrigger
    children: Array<
      | SequenceEditorTree_PropWithChildren
      | SequenceEditorTree_PrimitiveProp
      | SequenceEditorTree_GsapClipTrack
      | SequenceEditorTree_GsapChildClip
      | SequenceEditorTree_GsapScrollTriggerChild
    >
  }

export type SequenceEditorTree_PropWithChildren =
  SequenceEditorTree_Row<'propWithChildren'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    propConf: PropTypeConfig_Compound<UnknownValidCompoundProps>
    pathToProp: PathToProp
    children: Array<
      SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp
    >
    trackMapping: IPropPathToTrackIdTree
  }

export type SequenceEditorTree_PrimitiveProp =
  SequenceEditorTree_Row<'primitiveProp'> & {
    sheetObject: SheetObject
    pathToProp: PathToProp
    trackId: SequenceTrackId
    propConf: PropTypeConfig_AllSimples
  }

export type SequenceEditorTree_GsapClipTrack =
  SequenceEditorTree_Row<'gsapClipTrack'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    trackId: SequenceTrackId
    trackData: GsapClipTrack
    displayLabel: string
    children: SequenceEditorTree_GsapChildClip[]
  }

export type SequenceEditorTree_GsapChildClip =
  SequenceEditorTree_Row<'gsapChildClip'> & {
    sheetObject: SheetObject
    parentTrackId: SequenceTrackId
    parentTrackData: GsapClipTrack
    childId: string
    childData: GsapTimelineChildClip
    displayLabel: string
  }

export type SequenceEditorTree_GsapScrollTriggerTrack =
  SequenceEditorTree_Row<'gsapScrollTriggerTrack'> & {
    isCollapsed: boolean
    sheetObject: SheetObject
    scrollTriggerId: string
    layout: {start: number; duration: number}
    kind: 'tween' | 'timeline'
    animationSpanSeconds: number
    displayLabel: string
    children: SequenceEditorTree_GsapScrollTriggerChild[]
  }

export type SequenceEditorTree_GsapScrollTriggerChild =
  SequenceEditorTree_Row<'gsapScrollTriggerChild'> & {
    sheetObject: SheetObject
    scrollTriggerId: string
    parentLayout: {start: number; duration: number}
    childId: string
    displayLabel: string
    layout: {start: number; duration: number}
  }

export type SequenceEditorTree_AllRowTypes =
  | SequenceEditorTree_Sheet
  | SequenceEditorTree_ObjectNamespace
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_PropWithChildren
  | SequenceEditorTree_PrimitiveProp
  | SequenceEditorTree_GsapClipTrack
  | SequenceEditorTree_GsapChildClip
  | SequenceEditorTree_GsapScrollTriggerTrack
  | SequenceEditorTree_GsapScrollTriggerChild

/** Flatten sheet-level tree children into sheet object rows (namespace folders expanded). */
export function collectSheetObjectsFromSheetChildren(
  children: SequenceEditorTree_SheetChild[],
): SequenceEditorTree_SheetObject[] {
  const result: SequenceEditorTree_SheetObject[] = []
  for (const child of children) {
    if (child.type === 'sheetObject') {
      result.push(child)
    } else {
      result.push(...collectSheetObjectsFromSheetChildren(child.children))
    }
  }
  return result
}

const HEIGHT_OF_ANY_TITLE = 28

/**
 * Must run inside prism()
 */
export const calculateSequenceEditorTree = (
  sheet: Sheet,
  studio: Studio,
): SequenceEditorTree => {
  prism.ensurePrism()
  val(gsapStudioRegistryRevisionPointer)
  const rootShouldRender = true
  let topSoFar =
    transportStripHeight +
    titleBarHeight +
    (rootShouldRender ? HEIGHT_OF_ANY_TITLE : 0)
  let nSoFar = 0

  const collapsableItemSetP =
    studio.atomP.ahistoric.projects.stateByProjectId[sheet.address.projectId]
      .stateBySheetId[sheet.address.sheetId].sequence.collapsableItems

  const activeSequenceVariant = getStudioActiveSequenceVariant(sheet.address)

  const isCollapsedP =
    collapsableItemSetP.byId[createStudioSheetItemKey.forSheet()].isCollapsed
  const isCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

  const tree: SequenceEditorTree = {
    type: 'sheet',
    isCollapsed,
    sheet,
    children: [],
    sheetItemKey: createStudioSheetItemKey.forSheet(),
    shouldRender: rootShouldRender,
    top: transportStripHeight + titleBarHeight,
    depth: 0,
    n: nSoFar,
    nodeHeight: rootShouldRender ? HEIGHT_OF_ANY_TITLE : 0,
    heightIncludingChildren: -1, // calculated below
  }

  if (rootShouldRender) {
    nSoFar += 1
  }

  const sheetPropsObject = sheet.getSheetPropsObject()
  if (sheetPropsObject) {
    addObject(
      sheetPropsObject,
      tree.children,
      tree.depth + 1,
      rootShouldRender && !isCollapsed,
      {displayLabel: 'Sheet'},
    )
  }

  const objectsForNamespace: SheetObject[] = []
  for (const sheetObject of Object.values(val(sheet.objectsP))) {
    if (
      sheetObject &&
      !isSheetPropsObjectKey(sheetObject.address.objectKey) &&
      sheetObjectHasSequenceEditorContent(sheetObject)
    ) {
      objectsForNamespace.push(sheetObject)
    }
  }
  const namespaceRoot = buildSequenceEditorNamespaceMap(objectsForNamespace)
  appendNamespacedObjectsToTree(
    namespaceRoot,
    [],
    tree.children,
    tree.depth + 1,
    rootShouldRender && !isCollapsed,
  )
  tree.heightIncludingChildren = topSoFar - tree.top

  function sheetObjectHasSequenceEditorContent(
    sheetObject: SheetObject,
  ): boolean {
    const trackSetups = val(
      sheetObject.template.getMapOfValidSequenceTracks_forStudio(
        isSheetPropsObjectKey(sheetObject.address.objectKey)
          ? DEFAULT_SEQUENCE_VARIANT
          : activeSequenceVariant,
      ),
    )
    const sheetState = val(
      studio.atomP.historic.coreByProject[sheetObject.address.projectId]
        .sheetsById[sheetObject.address.sheetId],
    )
    const gsapClipEntries = listGsapClipTracksForObject(
      sheetState,
      sheetObject,
      isSheetPropsObjectKey(sheetObject.address.objectKey)
        ? DEFAULT_SEQUENCE_VARIANT
        : activeSequenceVariant,
    )
    return (
      Object.keys(trackSetups).length > 0 ||
      gsapClipEntries.length > 0 ||
      isRegisteredScrollTriggerSheetObject(sheetObject)
    )
  }

  function appendNamespacedObjectsToTree(
    map: NamespacedObjects,
    parentPath: string[],
    arrayOfChildren: SequenceEditorTree_SheetChild[],
    level: number,
    shouldRender: boolean,
  ) {
    for (const [label, {object, nested}] of map.entries()) {
      if (object) {
        addObject(object, arrayOfChildren, level, shouldRender, {
          displayLabel: label,
        })
      }
      if (nested) {
        addObjectNamespaceFolder(
          label,
          [...parentPath, label],
          nested,
          arrayOfChildren,
          level,
          shouldRender,
        )
      }
    }
  }

  function addObjectNamespaceFolder(
    label: string,
    namespacePath: string[],
    nested: NamespacedObjects,
    arrayOfChildren: SequenceEditorTree_SheetChild[],
    level: number,
    shouldRender: boolean,
  ) {
    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forObjectNamespaceFolder(
          sheet.address.sheetId,
          namespacePath,
        )
      ].isCollapsed
    const folderIsCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

    const row: SequenceEditorTree_ObjectNamespace = {
      type: 'objectNamespace',
      isCollapsed: folderIsCollapsed,
      label,
      sheetAddress: {
        projectId: sheet.address.projectId,
        sheetId: sheet.address.sheetId,
        sheetInstanceId: sheet.address.sheetInstanceId,
      },
      namespacePath,
      sheetItemKey: createStudioSheetItemKey.forObjectNamespaceFolder(
        sheet.address.sheetId,
        namespacePath,
      ),
      shouldRender,
      top: topSoFar,
      children: [],
      depth: level,
      n: nSoFar,
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: -1,
    }
    arrayOfChildren.push(row)

    if (shouldRender) {
      nSoFar += 1
      topSoFar += row.nodeHeight
    }

    appendNamespacedObjectsToTree(
      nested,
      namespacePath,
      row.children,
      level + 1,
      shouldRender && !folderIsCollapsed,
    )

    row.heightIncludingChildren = topSoFar - row.top
  }

  function addObject(
    sheetObject: SheetObject,
    arrayOfChildren: SequenceEditorTree_SheetChild[],
    level: number,
    shouldRender: boolean,
    options?: {displayLabel?: string},
  ) {
    const trackSetups = val(
      sheetObject.template.getMapOfValidSequenceTracks_forStudio(
        isSheetPropsObjectKey(sheetObject.address.objectKey)
          ? DEFAULT_SEQUENCE_VARIANT
          : activeSequenceVariant,
      ),
    )
    const objectConfig = val(sheetObject.template.configPointer)

    const sheetState = val(
      studio.atomP.historic.coreByProject[sheetObject.address.projectId]
        .sheetsById[sheetObject.address.sheetId],
    )
    const gsapClipEntries = listGsapClipTracksForObject(
      sheetState,
      sheetObject,
      isSheetPropsObjectKey(sheetObject.address.objectKey)
        ? DEFAULT_SEQUENCE_VARIANT
        : activeSequenceVariant,
    )

    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObject(sheetObject)
      ].isCollapsed
    const isCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

    const row: SequenceEditorTree_SheetObject = {
      type: 'sheetObject',
      isCollapsed,
      sheetItemKey: createStudioSheetItemKey.forSheetObject(sheetObject),
      shouldRender,
      top: topSoFar,
      children: [],
      depth: level,
      n: nSoFar,
      sheetObject: sheetObject,
      displayLabel: options?.displayLabel,
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: -1, // calculated below
    }
    arrayOfChildren.push(row)

    if (shouldRender) {
      nSoFar += 1
      topSoFar += row.nodeHeight
    }

    if (isGsapScrollTriggerSheetObjectKey(sheetObject.address.objectKey)) {
      attachInlineGsapScrollTriggerToSheetObject(
        sheetObject,
        row,
        level + 1,
        shouldRender && !isCollapsed,
      )
      row.heightIncludingChildren = topSoFar - row.top
      return
    }

    addProps(
      sheetObject,
      trackSetups,
      [],
      objectConfig,
      row.children,
      level + 1,
      shouldRender && !isCollapsed,
    )

    const isGsapProxy = isGsapSheetObjectKey(sheetObject.address.objectKey)
    const gsapClipsForSeparateRows: Array<{
      trackId: SequenceTrackId
      trackData: GsapClipTrack
    }> = []

    if (isGsapProxy && gsapClipEntries.length > 0) {
      const [firstClip, ...restClips] = gsapClipEntries
      attachInlineGsapClipToSheetObject(
        sheetObject,
        firstClip,
        row,
        level + 1,
        shouldRender && !isCollapsed,
      )
      gsapClipsForSeparateRows.push(...restClips)
    } else {
      gsapClipsForSeparateRows.push(...gsapClipEntries)
    }

    addGsapClipTrackRows(
      sheetObject,
      gsapClipsForSeparateRows,
      row.children,
      level + 2,
      shouldRender && !isCollapsed,
    )

    row.heightIncludingChildren = topSoFar - row.top
  }

  function attachInlineGsapClipToSheetObject(
    sheetObject: SheetObject,
    clip: {trackId: SequenceTrackId; trackData: GsapClipTrack},
    sheetObjectRow: SequenceEditorTree_SheetObject,
    childLevel: number,
    shouldRenderChildren: boolean,
  ) {
    const {trackId, trackData} = clip
    const entry = getAnimationEntryForSheetObject(sheetObject)
    const displayLabel =
      sheetObjectRow.displayLabel ?? entry?.label ?? trackData.gsapAnimationId
    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObjectGsapClipTrack(
          sheetObject,
          trackId,
        )
      ].isCollapsed
    const clipIsCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

    sheetObjectRow.gsapClip = {
      trackId,
      trackData,
      displayLabel,
      isCollapsed: clipIsCollapsed,
    }

    if (!trackData.timelineChildren?.length) {
      return
    }

    for (const childData of trackData.timelineChildren) {
      const childRow: SequenceEditorTree_GsapChildClip = {
        type: 'gsapChildClip',
        depth: childLevel,
        sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapChildClip(
          sheetObject,
          trackId,
          childData.childId,
        ),
        sheetObject,
        parentTrackId: trackId,
        parentTrackData: trackData,
        childId: childData.childId,
        childData,
        displayLabel: childData.label,
        shouldRender: shouldRenderChildren && !clipIsCollapsed,
        top: topSoFar,
        nodeHeight:
          shouldRenderChildren && !clipIsCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
        heightIncludingChildren:
          shouldRenderChildren && !clipIsCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
        n: nSoFar,
      }
      sheetObjectRow.children.push(childRow)
      if (shouldRenderChildren && !clipIsCollapsed) {
        nSoFar += 1
        topSoFar += childRow.nodeHeight
      }
    }
  }

  function listGsapClipTracksForObject(
    sheetState: SheetState_Historic | undefined,
    sheetObject: SheetObject,
    sequenceVariant: SequenceVariantId,
  ): Array<{trackId: SequenceTrackId; trackData: GsapClipTrack}> {
    if (!sheetState) return []
    const tracksOfObject = getSequenceStateFromSheet(
      sheetState,
      sequenceVariant,
    )?.tracksByObject[sheetObject.address.objectKey]
    if (!tracksOfObject) return []

    const linkedTrackIds = new Set(
      Object.values(tracksOfObject.trackIdByPropPath),
    )

    const entries: Array<{trackId: SequenceTrackId; trackData: GsapClipTrack}> =
      []
    for (const [trackId, trackData] of Object.entries(
      tracksOfObject.trackData,
    )) {
      if (linkedTrackIds.has(trackId)) continue
      if (!trackData || !isGsapClipTrack(trackData)) continue
      entries.push({trackId, trackData})
    }
    entries.sort((a, b) => a.trackData.start - b.trackData.start)
    return entries
  }

  function findScrollTriggerEntryForObject(
    sheetObject: SheetObject,
  ): ReturnType<typeof listScrollTriggerEntriesForSheet>[number] | undefined {
    const key = sheetAddressKey(sheetObject.address)
    for (const entry of listScrollTriggerEntriesForSheet(key)) {
      if (
        entry.sheetObject?.address.objectKey === sheetObject.address.objectKey
      ) {
        return entry
      }
    }
    return undefined
  }

  function attachInlineGsapScrollTriggerToSheetObject(
    sheetObject: SheetObject,
    sheetObjectRow: SequenceEditorTree_SheetObject,
    childLevel: number,
    shouldRenderChildren: boolean,
  ) {
    const entry = findScrollTriggerEntryForObject(sheetObject)
    if (!entry) return

    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObjectGsapScrollTriggerTrack(
          sheetObject,
          entry.id,
        )
      ].isCollapsed
    const stIsCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

    sheetObjectRow.displayLabel = sheetObjectRow.displayLabel ?? entry.label
    sheetObjectRow.gsapScrollTrigger = {
      scrollTriggerId: entry.id,
      layout: entry.layout,
      kind: entry.kind,
      animationSpanSeconds: entry.animationSpanSeconds,
      displayLabel: entry.label,
      isCollapsed: stIsCollapsed,
    }

    if (entry.kind !== 'timeline' || entry.timelineChildren.length === 0) {
      return
    }

    for (const childData of entry.timelineChildren) {
      const childRow: SequenceEditorTree_GsapScrollTriggerChild = {
        type: 'gsapScrollTriggerChild',
        depth: childLevel,
        sheetItemKey:
          createStudioSheetItemKey.forSheetObjectGsapScrollTriggerChild(
            sheetObject,
            entry.id,
            childData.childId,
          ),
        sheetObject,
        scrollTriggerId: entry.id,
        parentLayout: entry.layout,
        childId: childData.childId,
        displayLabel: childData.label,
        layout: scrollTriggerChildInSequenceSpace(
          entry.layout.start,
          entry.layout.duration,
          entry.animationSpanSeconds,
          childData,
        ),
        shouldRender: shouldRenderChildren && !stIsCollapsed,
        top: topSoFar,
        nodeHeight:
          shouldRenderChildren && !stIsCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
        heightIncludingChildren:
          shouldRenderChildren && !stIsCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
        n: nSoFar,
      }
      sheetObjectRow.children.push(childRow)
      if (shouldRenderChildren && !stIsCollapsed) {
        nSoFar += 1
        topSoFar += childRow.nodeHeight
      }
    }
  }

  function addGsapClipTrackRows(
    sheetObject: SheetObject,
    clips: Array<{trackId: SequenceTrackId; trackData: GsapClipTrack}>,
    arrayOfChildren: SequenceEditorTree_SheetObject['children'],
    level: number,
    shouldRender: boolean,
  ) {
    for (const {trackId, trackData} of clips) {
      const entry = getAnimationEntryForSheetObject(sheetObject)
      const displayLabel = entry?.label ?? trackData.gsapAnimationId
      const hasTimelineChildren = (trackData.timelineChildren?.length ?? 0) > 0
      const isCollapsedP =
        collapsableItemSetP.byId[
          createStudioSheetItemKey.forSheetObjectGsapClipTrack(
            sheetObject,
            trackId,
          )
        ].isCollapsed
      const isCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

      const row: SequenceEditorTree_GsapClipTrack = {
        type: 'gsapClipTrack',
        isCollapsed,
        depth: level,
        sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapClipTrack(
          sheetObject,
          trackId,
        ),
        sheetObject,
        trackId,
        trackData,
        displayLabel,
        shouldRender,
        top: topSoFar,
        nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
        heightIncludingChildren: -1,
        children: [],
        n: nSoFar,
      }
      arrayOfChildren.push(row)

      if (shouldRender) {
        nSoFar += 1
        topSoFar += row.nodeHeight
      }

      if (hasTimelineChildren && trackData.timelineChildren) {
        for (const childData of trackData.timelineChildren) {
          const childRow: SequenceEditorTree_GsapChildClip = {
            type: 'gsapChildClip',
            depth: level + 1,
            sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapChildClip(
              sheetObject,
              trackId,
              childData.childId,
            ),
            sheetObject,
            parentTrackId: trackId,
            parentTrackData: trackData,
            childId: childData.childId,
            childData,
            displayLabel: childData.label,
            shouldRender: shouldRender && !isCollapsed,
            top: topSoFar,
            nodeHeight: shouldRender && !isCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
            heightIncludingChildren:
              shouldRender && !isCollapsed ? HEIGHT_OF_ANY_TITLE : 0,
            n: nSoFar,
          }
          row.children.push(childRow)
          if (shouldRender && !isCollapsed) {
            nSoFar += 1
            topSoFar += childRow.nodeHeight
          }
        }
      }

      row.heightIncludingChildren = topSoFar - row.top
    }
  }

  function addProps(
    sheetObject: SheetObject,
    trackSetups: IPropPathToTrackIdTree,
    pathSoFar: PathToProp,
    parentPropConfig: PropTypeConfig_Compound<$IntentionalAny>,
    arrayOfChildren: SequenceEditorTree_SheetObject['children'],
    level: number,
    shouldRender: boolean,
  ) {
    for (const [propKey, setupOrSetups] of Object.entries(trackSetups)) {
      const propConfig = parentPropConfig.props[propKey]
      addProp(
        sheetObject,
        setupOrSetups!,
        [...pathSoFar, propKey],
        propConfig,
        arrayOfChildren,
        level,
        shouldRender,
      )
    }
  }

  function addProp(
    sheetObject: SheetObject,
    trackIdOrMapping: SequenceTrackId | IPropPathToTrackIdTree,
    pathToProp: PathToProp,
    conf: PropTypeConfig,
    arrayOfChildren: SequenceEditorTree_SheetObject['children'],
    level: number,
    shouldRender: boolean,
  ) {
    if (sheetObject.template.isNonSequencablePropPath(pathToProp)) {
      return
    }

    if (conf.type === 'compound') {
      const trackMapping =
        trackIdOrMapping as $IntentionalAny as IPropPathToTrackIdTree
      addProp_compound(
        sheetObject,
        trackMapping,
        conf,
        pathToProp,
        conf,
        arrayOfChildren,
        level,
        shouldRender,
      )
    } else if (conf.type === 'enum') {
      logger.warn('Prop type enum is not yet supported in the sequence editor')
    } else {
      const trackId = trackIdOrMapping as $IntentionalAny as SequenceTrackId

      addProp_primitive(
        sheetObject,
        trackId,
        pathToProp,
        conf,
        arrayOfChildren,
        level,
        shouldRender,
      )
    }
  }

  function addProp_compound(
    sheetObject: SheetObject,
    trackMapping: IPropPathToTrackIdTree,
    propConf: PropTypeConfig_Compound<UnknownValidCompoundProps>,
    pathToProp: PathToProp,
    conf: PropTypeConfig_Compound<$FixMe>,
    arrayOfChildren: SequenceEditorTree_SheetObject['children'],
    level: number,
    shouldRender: boolean,
  ) {
    const isCollapsedP =
      collapsableItemSetP.byId[
        createStudioSheetItemKey.forSheetObjectProp(sheetObject, pathToProp)
      ].isCollapsed
    const isCollapsed = pointerToPrism(isCollapsedP).getValue() ?? false

    const row: SequenceEditorTree_PropWithChildren = {
      type: 'propWithChildren',
      isCollapsed,
      propConf,
      pathToProp,
      sheetItemKey: createStudioSheetItemKey.forSheetObjectProp(
        sheetObject,
        pathToProp,
      ),
      sheetObject: sheetObject,
      shouldRender,
      top: topSoFar,
      children: [],
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: -1,
      depth: level,
      trackMapping,
      n: nSoFar,
    }
    arrayOfChildren.push(row)

    if (shouldRender) {
      topSoFar += row.nodeHeight
      nSoFar += 1
    }

    addProps(
      sheetObject,
      trackMapping,
      pathToProp,
      conf,
      row.children,
      level + 1,
      // collapsed shouldn't render child props
      shouldRender && !isCollapsed,
    )
    // }
    row.heightIncludingChildren = topSoFar - row.top
  }

  function addProp_primitive(
    sheetObject: SheetObject,
    trackId: SequenceTrackId,
    pathToProp: PathToProp,
    propConf: PropTypeConfig_AllSimples,
    arrayOfChildren: SequenceEditorTree_SheetObject['children'],
    level: number,
    shouldRender: boolean,
  ) {
    const row: SequenceEditorTree_PrimitiveProp = {
      type: 'primitiveProp',
      propConf: propConf,
      depth: level,
      sheetItemKey: createStudioSheetItemKey.forSheetObjectProp(
        sheetObject,
        pathToProp,
      ),
      sheetObject: sheetObject,
      pathToProp,
      shouldRender,
      top: topSoFar,
      nodeHeight: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      heightIncludingChildren: shouldRender ? HEIGHT_OF_ANY_TITLE : 0,
      trackId,
      n: nSoFar,
    }
    arrayOfChildren.push(row)
    nSoFar += 1
    topSoFar += row.nodeHeight
  }

  return tree
}

/** View-model for rendering a GSAP parent clip bar on a sheet object row. */
export function sequenceEditorTreeGsapClipTrackLeafFromSheetObject(
  sheetRow: SequenceEditorTree_SheetObject,
): SequenceEditorTree_GsapClipTrack | null {
  const gsapClip = sheetRow.gsapClip
  if (!gsapClip) return null

  const timelineChildren = sheetRow.children.filter(
    (child): child is SequenceEditorTree_GsapChildClip =>
      child.type === 'gsapChildClip',
  )

  return {
    type: 'gsapClipTrack',
    isCollapsed: gsapClip.isCollapsed,
    depth: sheetRow.depth,
    sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapClipTrack(
      sheetRow.sheetObject,
      gsapClip.trackId,
    ),
    sheetObject: sheetRow.sheetObject,
    trackId: gsapClip.trackId,
    trackData: gsapClip.trackData,
    displayLabel: gsapClip.displayLabel,
    shouldRender: sheetRow.shouldRender,
    top: sheetRow.top,
    nodeHeight: sheetRow.nodeHeight,
    heightIncludingChildren: sheetRow.heightIncludingChildren,
    children: timelineChildren,
    n: sheetRow.n,
  }
}

/** View-model for rendering a ScrollTrigger bar on a sheet object row. */
export function sequenceEditorTreeGsapScrollTriggerTrackLeafFromSheetObject(
  sheetRow: SequenceEditorTree_SheetObject,
): SequenceEditorTree_GsapScrollTriggerTrack | null {
  const inline = sheetRow.gsapScrollTrigger
  if (!inline) return null

  const timelineChildren = sheetRow.children.filter(
    (child): child is SequenceEditorTree_GsapScrollTriggerChild =>
      child.type === 'gsapScrollTriggerChild',
  )

  return {
    type: 'gsapScrollTriggerTrack',
    isCollapsed: inline.isCollapsed,
    depth: sheetRow.depth,
    sheetItemKey: createStudioSheetItemKey.forSheetObjectGsapScrollTriggerTrack(
      sheetRow.sheetObject,
      inline.scrollTriggerId,
    ),
    sheetObject: sheetRow.sheetObject,
    scrollTriggerId: inline.scrollTriggerId,
    layout: inline.layout,
    kind: inline.kind,
    animationSpanSeconds: inline.animationSpanSeconds,
    displayLabel: inline.displayLabel,
    shouldRender: sheetRow.shouldRender,
    top: sheetRow.top,
    nodeHeight: sheetRow.nodeHeight,
    heightIncludingChildren: sheetRow.heightIncludingChildren,
    children: timelineChildren,
    n: sheetRow.n,
  }
}
