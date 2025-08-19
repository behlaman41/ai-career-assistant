import { InMemoryStorageProvider } from '../storage';

describe('InMemoryStorageProvider', () => {
  let provider: InMemoryStorageProvider;

  beforeEach(() => {
    provider = new InMemoryStorageProvider();
  });

  describe('putObject', () => {
    it('should store a buffer object', async () => {
      const content = Buffer.from('Hello, world!');
      const key = 'test.txt';

      await expect(provider.putObject(key, content)).resolves.not.toThrow();
    });

    it('should store a string object', async () => {
      const content = 'Hello, world!';
      const key = 'test.txt';

      await expect(provider.putObject(key, content)).resolves.not.toThrow();
    });

    it('should handle empty content', async () => {
      const content = Buffer.from('');
      const key = 'empty.txt';

      await expect(provider.putObject(key, content)).resolves.not.toThrow();
    });

    it('should handle binary content', async () => {
      const content = Buffer.from([0x00, 0x01, 0x02, 0xff]);
      const key = 'binary.bin';

      await expect(provider.putObject(key, content)).resolves.not.toThrow();
    });
  });

  describe('getObject', () => {
    it('should retrieve a stored object', async () => {
      const originalContent = Buffer.from('Test content');
      const key = 'test.txt';

      await provider.putObject(key, originalContent);
      const retrievedContent = await provider.getObject(key);

      expect(retrievedContent).toEqual(originalContent);
    });

    it('should throw error for non-existent key', async () => {
      const nonExistentKey = 'non-existent-key';

      await expect(provider.getObject(nonExistentKey)).rejects.toThrow();
    });

    it('should handle multiple store and retrieve operations', async () => {
      const files = [
        { content: Buffer.from('File 1'), key: 'file1.txt' },
        { content: Buffer.from('File 2'), key: 'file2.txt' },
        { content: Buffer.from('File 3'), key: 'file3.txt' },
      ];

      await Promise.all(files.map((file) => provider.putObject(file.key, file.content)));

      const retrievedContents = await Promise.all(
        files.map((file) => provider.getObject(file.key)),
      );

      retrievedContents.forEach((content: Buffer, index: number) => {
        expect(content).toEqual(files[index].content);
      });
    });
  });

  describe('getSignedUrl', () => {
    it('should return a signed URL for GET method', async () => {
      const key = 'test.txt';
      const url = await provider.getSignedUrl(key, 'GET');

      expect(url).toBe('memory://get/test.txt');
    });

    it('should return a signed URL for PUT method', async () => {
      const key = 'test.txt';
      const url = await provider.getSignedUrl(key, 'PUT');

      expect(url).toBe('memory://put/test.txt');
    });

    it('should default to PUT method', async () => {
      const key = 'test.txt';
      const url = await provider.getSignedUrl(key);

      expect(url).toBe('memory://put/test.txt');
    });
  });

  describe('deleteObject', () => {
    it('should delete a stored object', async () => {
      const content = Buffer.from('Test content');
      const key = 'test.txt';

      await provider.putObject(key, content);
      await provider.deleteObject(key);

      await expect(provider.getObject(key)).rejects.toThrow();
    });
  });

  describe('integration', () => {
    it('should maintain data integrity across put and get cycles', async () => {
      const testData = [
        { content: 'Simple text', key: 'simple.txt' },
        { content: JSON.stringify({ key: 'value', number: 42 }), key: 'data.json' },
        { content: 'Line 1\nLine 2\nLine 3', key: 'multiline.txt' },
        { content: '', key: 'empty.txt' },
      ];

      for (const data of testData) {
        const content = Buffer.from(data.content);
        await provider.putObject(data.key, content);
        const retrieved = await provider.getObject(data.key);

        expect(retrieved.toString()).toBe(data.content);
      }
    });
  });
});
