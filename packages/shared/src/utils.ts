export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here: " + x);
}

export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}
