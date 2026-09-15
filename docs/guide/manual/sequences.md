# Working with sequences

Each sheet has one **sequence**—the timeline of sequenced props.

## Sequencing props

1. Select an object.
2. In the Details Panel, right-click a prop → **Sequence**.
3. Keyframes appear in the Sequence Editor (dope sheet).

For compound props, right-click the group → **Sequence all**.

Use **Make static** to remove a prop from the timeline (deletes its keyframes).

## Keyframes

- Click the diamond on a track to add a keyframe at the playhead.
- Right-click a keyframe → **Delete**.
- Click a keyframe to edit values in the inline editor.

## Aggregate keyframes

Compound props get aggregate keyframes when child keyframes share the same time—drag them to move the group.

## Focus range

Drag with `Shift` + left mouse in the sequencer header to define a focus range for editing. See [Keyboard shortcuts](./keyboard-shortcuts.md).

## Playback from code

```ts
sheet.sequence.play()
sheet.sequence.pause()
sheet.sequence.position = 2.5
```

Attach audio with `sheet.sequence.attachAudio()` ([Audio](./audio.md)).

## API

[Sequence API](/api/theatre-core#sequence)
