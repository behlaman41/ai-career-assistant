import { EmbeddingProvider, StubEmbeddingProvider } from './embedding';
import { EchoLLMProvider, LLMProvider } from './llm';
import { MinioStorageProvider, StorageProvider } from './storage';

export interface ProviderRegistryOptions {
  llm?: LLMProvider;
  embedding?: EmbeddingProvider;
  storage?: StorageProvider;
}

export class ProviderRegistry {
  llm: LLMProvider;
  embedding: EmbeddingProvider;
  storage: StorageProvider;

  constructor(opts: ProviderRegistryOptions = {}) {
    this.llm = opts.llm ?? new EchoLLMProvider();
    this.embedding = opts.embedding ?? new StubEmbeddingProvider(1536);
    this.storage =
      opts.storage ??
      new MinioStorageProvider(
        process.env.S3_BUCKET || 'files',
        process.env.S3_ENDPOINT || 'http://minio:9000',
        process.env.S3_ACCESS_KEY || 'minioadmin',
        process.env.S3_SECRET_KEY || 'minioadmin',
      );
  }
}