import type {Pointer} from '@unseenco/theatre-dataverse'
import {Atom, pointer} from '@unseenco/theatre-dataverse'
import type {
  GsapClipTrack,
  GsapTimelineChildClip,
  Keyframe,
} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceTrackId} from '@unseenco/theatre-shared/utils/ids'
import type {ISequence} from './TheatreSequence'

const LITE_DEFAULT_LENGTH = 10

/**
 * Inert `ISequence` for `@unseenco/theatre-core-lite` (position 0, no playback).
 */
export default class TheatreSequenceLite implements ISequence {
  readonly type = 'Theatre_Sequence_PublicAPI' as const

  private readonly _state = new Atom({
    playing: false,
    length: LITE_DEFAULT_LENGTH,
    position: 0,
  })

  readonly pointer: Pointer<{
    playing: boolean
    length: number
    position: number
  }> = pointer({root: this._state.pointer, path: []})

  play(): Promise<boolean> {
    return Promise.resolve(true)
  }

  pause(): void {}

  get position(): number {
    return 0
  }

  set position(_position: number) {}

  __experimental_getKeyframes(_prop: Pointer<{}>): Keyframe[] {
    return []
  }

  __experimental_getGsapClips(): Array<{
    objectKey: string
    trackId: SequenceTrackId
    clip: GsapClipTrack
  }> {
    return []
  }

  __experimental_getGsapScrollTriggers(): Array<{
    objectKey: string
    scrollTriggerId: string
    label: string
    layout: {start: number; duration: number}
    kind: 'tween' | 'timeline'
    animationSpanSeconds: number
    timelineChildren: GsapTimelineChildClip[]
  }> {
    return []
  }

  attachAudio(_args: {
    source: string | AudioBuffer
    audioContext?: AudioContext
    destinationNode?: AudioNode
  }): Promise<{
    decodedBuffer: AudioBuffer
    audioContext: AudioContext
    destinationNode: AudioNode
    gainNode: GainNode
  }> {
    return Promise.reject(
      new Error(
        'sequence.attachAudio() is not available in @unseenco/theatre-core-lite',
      ),
    )
  }
}
