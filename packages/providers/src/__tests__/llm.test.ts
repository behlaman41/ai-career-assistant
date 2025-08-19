import { EchoLLMProvider } from '../llm';

describe('EchoLLMProvider', () => {
  let provider: EchoLLMProvider;

  beforeEach(() => {
    provider = new EchoLLMProvider();
  });

  describe('complete', () => {
    it('should return the input prompt with ECHO prefix', async () => {
      const prompt = 'Hello, world!';
      const result = await provider.complete(prompt);

      expect(result).toBe('ECHO: Hello, world!');
    });

    it('should handle empty prompts', async () => {
      const prompt = '';
      const result = await provider.complete(prompt);

      expect(result).toBe('ECHO: ');
    });

    it('should handle multiline prompts', async () => {
      const prompt = 'Line 1\nLine 2\nLine 3';
      const result = await provider.complete(prompt);

      expect(result).toBe('ECHO: Line 1\nLine 2\nLine 3');
    });

    it('should handle special characters', async () => {
      const prompt = 'Special chars: @#$%^&*()';
      const result = await provider.complete(prompt);

      expect(result).toBe('ECHO: Special chars: @#$%^&*()');
    });
  });
});
