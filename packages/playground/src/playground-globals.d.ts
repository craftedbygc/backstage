declare module '*.png' {
  export default string
}

declare module '*.jpg' {
  export default string
}

declare module '*.glb' {
  export default string
}

declare module '*.gltf' {
  export default string
}

declare module '*.mp3' {
  export default string
}

declare module '*.ogg' {
  export default string
}

declare module '@unseenco/backstage/threejs?backstage-lite-peers' {
  export * from '@unseenco/backstage/threejs'
}

declare module '@unseenco/backstage/threejs/extension?backstage-lite-peers' {
  export * from '@unseenco/backstage/threejs/extension'
}

/** Injected by `packages/playground/vite.config.ts` (demo folder names per group). */
declare const __PLAYGROUND_DEMO_GROUPS__: Record<string, string[]>
