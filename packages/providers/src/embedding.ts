export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

// Default stub embeddings provider generates repeatable pseudo-random normalized vectors
export class StubEmbeddingProvider implements EmbeddingProvider {
  constructor(private dim: number = 1536) {}

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.hashToVector(t));
  }

  private hashToVector(text: string): number[] {
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
    const vec: number[] = new Array(this.dim).fill(0).map((_, idx) => {
      seed = (1103515245 * seed + 12345) & 0x7fffffff;
      return ((seed / 0x7fffffff) * 2 - 1) * (idx % 2 === 0 ? 1 : -1);
    });
    return normalizeVector(vec);
  }
}