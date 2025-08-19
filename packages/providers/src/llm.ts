export interface CompleteOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
}

export class EchoLLMProvider implements LLMProvider {
  async complete(prompt: string): Promise<string> {
    return `ECHO: ${prompt}`;
  }
}
