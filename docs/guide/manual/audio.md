# Using audio

Sync music or narration to a sheet sequence with the Web Audio API.

## attachAudio

```ts
await sheet.sequence.attachAudio({
  source: '/audio/track.mp3',
})
sheet.sequence.play()
```

Theatre fetches the file, creates an `AudioContext`, and decodes the buffer. Browsers may block audio until a user gesture; prompt the user to click before calling `play()`.

## Custom audio graph

Pass `audioContext`, `audioBuffer`, and `destinationNode` if you manage loading yourself:

```ts
sheet.sequence.attachAudio({
  audioContext,
  audioBuffer,
  destinationNode: audioContext.destination,
})
```

## API

[`Sequence.attachAudio`](/api/theatre-core)
