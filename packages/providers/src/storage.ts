import { Client } from 'minio';

export interface StorageProvider {
  putObject(key: string, data: Buffer | Uint8Array | string, mime?: string): Promise<void>;
  getObject(key: string): Promise<Buffer>;
  getSignedUrl(key: string, method?: 'GET' | 'PUT', expirySeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export class InMemoryStorageProvider implements StorageProvider {
  private storage = new Map<string, Buffer>();

  async putObject(key: string, data: Buffer | Uint8Array | string): Promise<void> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    this.storage.set(key, buffer);
  }

  async getObject(key: string): Promise<Buffer> {
    const data = this.storage.get(key);
    if (!data) {
      throw new Error(`Object with key '${key}' not found`);
    }
    return data;
  }

  async getSignedUrl(key: string, method: 'GET' | 'PUT' = 'PUT'): Promise<string> {
    return `memory://${method.toLowerCase()}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

export class MinioStorageProvider implements StorageProvider {
  private client: Client;
  constructor(
    private bucket: string,
    endpoint: string,
    accessKey: string,
    secretKey: string,
  ) {
    const { hostname, port, protocol } = new URL(endpoint);
    this.client = new Client({
      endPoint: hostname,
      port: Number(port) || (protocol === 'https:' ? 443 : 80),
      useSSL: protocol === 'https:',
      accessKey,
      secretKey,
    });
  }

  async putObject(key: string, data: Buffer | Uint8Array | string, mime?: string): Promise<void> {
    const bufferData = data instanceof Uint8Array ? Buffer.from(data) : data;
    await this.client.putObject(this.bucket, key, bufferData, undefined, { 'Content-Type': mime });
  }

  async getObject(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) chunks.push(chunk as Uint8Array);
    return Buffer.concat(chunks);
  }

  async getSignedUrl(key: string, method: 'GET' | 'PUT' = 'PUT', expirySeconds = 60 * 10): Promise<string> {
    if (method === 'GET') {
      return this.client.presignedGetObject(this.bucket, key, expirySeconds);
    }
    return this.client.presignedPutObject(this.bucket, key, expirySeconds);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}