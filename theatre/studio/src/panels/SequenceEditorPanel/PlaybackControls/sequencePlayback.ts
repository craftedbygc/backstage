import getStudio from '@unseenco/theatre-studio/getStudio'
import type {IPlaybackRange} from '@unseenco/theatre-core/sequences/Sequence'
import type Sequence from '@unseenco/theatre-core/sequences/Sequence'
import {maxGsapClipEndTime} from '@unseenco/theatre-shared/sequence/trackData'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import type {Prism} from '@unseenco/theatre-dataverse'
import {Atom, prism, val} from '@unseenco/theatre-dataverse'
import memoizeFn from '@unseenco/theatre-shared/utils/memoizeFn'
import type {
  SheetAddress,
  WithoutSheetInstance,
} from '@unseenco/theatre-shared/utils/addresses'
import {syncPageScrollToSequencePosition} from '@unseenco/theatre-studio/sheets/syncPageScrollToSequencePosition'

function syncPageScrollAfterTransportSeek(sequence: Sequence): void {
  syncPageScrollToSequencePosition(sequence._sheet)
}

type ControlledPlaybackState = {
  range: IPlaybackRange
  isFollowingARange: boolean
}

type ControlledPlaybackStateBox = Atom<
  undefined | Prism<ControlledPlaybackState>
>

const getPlaybackStateBox = memoizeFn(
  (sequence: Sequence): ControlledPlaybackStateBox => {
    return new Atom(undefined) as ControlledPlaybackStateBox
  },
)

function getSequenceAhistoricFocusRange(sequence: Sequence) {
  const {projectId, sheetId} = sequence.address
  return val(
    getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
      .stateBySheetId[sheetId].sequence.focusRange,
  )
}

/**
 * `undefined` looping state is treated as `true` to preserve legacy Space behavior.
 */
export function getSequenceLooping(sequence: Sequence): boolean {
  const {projectId, sheetId} = sequence.address
  const looping = val(
    getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
      .stateBySheetId[sheetId].sequence.looping,
  )
  return looping !== false
}

export function setSequenceLooping(
  address: WithoutSheetInstance<SheetAddress>,
  looping: boolean,
) {
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.ahistoric.projects.stateByProjectId.stateBySheetId.sequence.setLooping(
      {
        ...address,
        looping,
      },
    )
  })
}

function createControlledPlaybackStatePrism(
  seq: Sequence,
): Prism<ControlledPlaybackState> {
  const {projectId, sheetId} = seq.address

  return prism((): ControlledPlaybackState => {
    const focusRange = val(
      getStudio().atomP.ahistoric.projects.stateByProjectId[projectId]
        .stateBySheetId[sheetId].sequence.focusRange,
    )

    const shouldFollowFocusRange = prism.memo<boolean>(
      'shouldFollowFocusRange',
      (): boolean => {
        const posBeforePlay = seq.position
        if (focusRange) {
          const withinRange =
            posBeforePlay >= focusRange.range.start &&
            posBeforePlay <= focusRange.range.end
          if (focusRange.enabled) {
            return withinRange
          } else {
            return true
          }
        } else {
          return true
        }
      },
      [],
    )

    if (shouldFollowFocusRange && focusRange && focusRange.enabled) {
      return {
        range: [focusRange.range.start, focusRange.range.end],
        isFollowingARange: true,
      }
    } else {
      const sequenceLength = val(seq.pointer.length)
      return {range: [0, sequenceLength], isFollowingARange: false}
    }
  })
}

/**
 * Enabled focus range bounds when available; otherwise the full sequence.
 */
export function getJumpRange(sequence: Sequence): IPlaybackRange {
  const focusRange = getSequenceAhistoricFocusRange(sequence)
  if (focusRange && focusRange.enabled) {
    return [focusRange.range.start, focusRange.range.end]
  }
  return [0, sequence.length]
}

export function jumpToStart(sequence: Sequence) {
  sequence.position = getJumpRange(sequence)[0]
  syncPageScrollAfterTransportSeek(sequence)
}

export function jumpToEnd(sequence: Sequence) {
  const [, rangeEnd] = getJumpRange(sequence)
  const clipEnd = maxGsapClipEndTime(
    sequence.publicApi.__experimental_getGsapClips().map(({clip}) => clip),
  )
  const targetEnd = Math.max(rangeEnd, clipEnd)

  if (sequence._sheet.getSequenceMode() === 'page') {
    sequence.position = Math.min(targetEnd, sequence.length)
    syncPageScrollAfterTransportSeek(sequence)
    return
  }

  if (targetEnd > sequence.length) {
    const studio = getStudio()
    if (studio) {
      studio.transaction(({stateEditors}) => {
        stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
          projectId: sequence.address.projectId,
          sheetId: sequence.address.sheetId,
          sequenceVariant: getStudioActiveSequenceVariant(sequence.address),
          length: targetEnd,
        })
      })
    }
  }

  sequence.position = targetEnd
  syncPageScrollAfterTransportSeek(sequence)
}

export function stepFrame(sequence: Sequence, direction: -1 | 1) {
  const frame = 1 / sequence.subUnitsPerUnit
  sequence.position = sequence.closestGridPosition(
    sequence.position + direction * frame,
  )
  syncPageScrollAfterTransportSeek(sequence)
}

export function toggleSequencePlayback(seq: Sequence) {
  if (seq._sheet.getSequenceMode() === 'page') {
    return
  }
  if (seq.playing) {
    seq.pause()
    return
  }

  const controlledPlaybackStateD = createControlledPlaybackStatePrism(seq)
  const {range} = val(controlledPlaybackStateD)
  const looping = getSequenceLooping(seq)
  const playbackStateBox = getPlaybackStateBox(seq)

  playbackStateBox.set(controlledPlaybackStateD)

  const playbackPromise = looping
    ? seq.playDynamicRange(
        prism(() => val(controlledPlaybackStateD).range),
        getStudio().ticker,
      )
    : seq.play(
        {iterationCount: 1, range: [range[0], range[1]]},
        getStudio().ticker,
      )

  void playbackPromise.finally(() => {
    playbackStateBox.set(undefined)
  })
}

/*
 * A memoized function that returns a prism with a boolean value.
 * This value is set to `true` if:
 * 1. the playback is playing and using the focus range instead of the whole sequence
 * 2. the playback is stopped, but would use the focus range if it were started.
 */
export const getIsPlayheadAttachedToFocusRange = memoizeFn(
  (sequence: Sequence) =>
    prism<boolean>(() => {
      const controlledPlaybackState =
        getPlaybackStateBox(sequence).prism.getValue()
      if (controlledPlaybackState) {
        return controlledPlaybackState.getValue().isFollowingARange
      } else {
        const focusRange = getSequenceAhistoricFocusRange(sequence)

        if (!focusRange || !focusRange.enabled) return false

        const pos = val(sequence.pointer.position)

        const withinRange =
          pos >= focusRange.range.start && pos <= focusRange.range.end
        return withinRange
      }
    }),
)
