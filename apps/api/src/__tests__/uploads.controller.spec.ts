import { ProviderRegistry } from '@ai-career/providers';
import { Test, TestingModule } from '@nestjs/testing';

import { DocumentsController } from '../modules/documents/documents.controller';
import { DocumentsService } from '../modules/documents/documents.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { QueuesService } from '../modules/queues/queues.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;
  let prismaService: jest.Mocked<PrismaService>;
  let providerRegistry: jest.Mocked<ProviderRegistry>;
  let queuesService: jest.Mocked<QueuesService>;

  beforeEach(async () => {
    const mockPrismaService = {
      document: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockStorageProvider = {
      getSignedUrl: jest.fn(),
      putObject: jest.fn(),
      getObject: jest.fn(),
      deleteObject: jest.fn(),
    };

    const mockProviderRegistry = {
      storage: mockStorageProvider,
    };

    const mockQueuesService = {
      addParseJob: jest.fn(),
      addEmbedJob: jest.fn(),
      addAnalysisJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProviderRegistry,
          useValue: mockProviderRegistry,
        },
        {
          provide: QueuesService,
          useValue: mockQueuesService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    prismaService = module.get(PrismaService);
    providerRegistry = module.get(ProviderRegistry);
    queuesService = module.get(QueuesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initUpload', () => {
    it('should return upload URL and document ID', async () => {
      const mockUrl = 'https://storage.example.com/upload-url';
      const mockDocumentId = '123e4567-e89b-12d3-a456-426614174000';
      
      // Mock is not needed here since we're mocking the service method directly
      jest.spyOn(service, 'initUpload').mockResolvedValue({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });

      const result = await controller.initUpload(
        {
          mime: 'application/pdf',
          sha256: 'a'.repeat(64),
        },
        'user123'
      );

      expect(result).toEqual({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });
      expect(service.initUpload).toHaveBeenCalledWith('user123', {
        mime: 'application/pdf',
        sha256: 'a'.repeat(64),
      });
    });

    it('should handle different mime types', async () => {
      const mockUrl = 'https://storage.example.com/upload-url';
      const mockDocumentId = '123e4567-e89b-12d3-a456-426614174001';
      
      // Mock is not needed here since we're mocking the service method directly
      jest.spyOn(service, 'initUpload').mockResolvedValue({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });

      const result = await controller.initUpload(
        {
          mime: 'text/plain',
          sha256: 'b'.repeat(64),
        },
        'user456'
      );

      expect(result).toEqual({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });
    });
  });
});