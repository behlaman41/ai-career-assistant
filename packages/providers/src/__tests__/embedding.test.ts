import { StubEmbeddingProvider } from '../embedding';

describe('StubEmbeddingProvider', () => {
  let provider: StubEmbeddingProvider;

  beforeEach(() => {
    provider = new StubEmbeddingProvider(384); // Use 384 dimensions for testing
  });

  describe('embed', () => {
    it('should return fixed-size embedding vectors for multiple texts', async () => {
      const texts = ['Hello, world!', 'Another text'];
      const result = await provider.embed(texts);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(384);
      expect(result[1]).toHaveLength(384);
      expect(result[0].every((num: number) => typeof num === 'number')).toBe(true);
      expect(result[1].every((num: number) => typeof num === 'number')).toBe(true);
    });

    it('should return consistent embeddings for the same text', async () => {
      const texts = ['Consistent text'];
      const result1 = await provider.embed(texts);
      const result2 = await provider.embed(texts);

      expect(result1).toEqual(result2);
    });

    it('should handle empty text', async () => {
      const texts = [''];
      const result = await provider.embed(texts);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(384);
      expect(result[0].every((num: number) => typeof num === 'number')).toBe(true);
    });

    it('should handle long text', async () => {
      const texts = ['A'.repeat(1000)];
      const result = await provider.embed(texts);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(384);
      expect(result[0].every((num: number) => typeof num === 'number')).toBe(true);
    });

    it('should return different embeddings for different texts', async () => {
      const texts1 = ['First text'];
      const texts2 = ['Second text'];
      const result1 = await provider.embed(texts1);
      const result2 = await provider.embed(texts2);

      expect(result1[0]).not.toEqual(result2[0]);
    });

    it('should handle multiple texts in one call', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const result = await provider.embed(texts);

      expect(result).toHaveLength(3);
      result.forEach((embedding) => {
        expect(embedding).toHaveLength(384);
        expect(embedding.every((num: number) => typeof num === 'number')).toBe(true);
      });
    });
  });
});
