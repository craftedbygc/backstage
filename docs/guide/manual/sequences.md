# Working with sequences

> **Not in Backstage Lite:** Sequences, keyframes, and the Sequence Editor are full-Backstage features. Lite uses static props and [sheet variants](../backstage-lite/variants.md) only. See [Choosing lite or full](../backstage-lite/choosing-lite-or-full.md).

Each sheet has one **sequence**—the timeline of sequenced props.

## Sequencing props

1. Select an object.
2. In the Details Panel, right-click a prop → **Sequence**.
3. Keyframes appear in the Sequence Editor (dope sheet).

For compound props, right-click the group → **Sequence all**.

Use **Make static** to remove a prop from the timeline (deletes its keyframes).

## Custom tween labels

Right-click a **connector bar** between keyframes in the Sequence Editor → **Name** to assign a custom tween name. Labels persist in project state, show on the bar (ellipsis + hover tooltip), and can be cleared from the same menu.

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

[Sequence API](/api/backstage-core#sequence)
