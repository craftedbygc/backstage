import type BackstageSequence from '@unseenco/backstage/sequences/BackstageSequence'

export function toggleSequencePlayback(_seq: BackstageSequence): void {}

export function getIsPlayheadAttachedToFocusRange(): boolean {
  return false
}
