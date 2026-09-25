/** Returns true when two blobs have identical byte content. */
export async function blobsEqual(a: Blob, b: Blob): Promise<boolean> {
  if (a.size !== b.size) return false
  const [bufA, bufB] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()])
  const viewA = new Uint8Array(bufA)
  const viewB = new Uint8Array(bufB)
  if (viewA.length !== viewB.length) return false
  for (let i = 0; i < viewA.length; i++) {
    if (viewA[i] !== viewB[i]) return false
  }
  return true
}
