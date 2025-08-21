import { ProviderRegistry } from '@ai-career/providers';
import { Test, TestingModule } from '@nestjs/testing';

import { AuditService } from '../modules/audit/audit.service';
import { DocumentsController } from '../modules/documents/documents.controller';
import { DocumentsService } from '../modules/documents/documents.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { QueuesService } from '../modules/queues/queues.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

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

    const mockAuditService = {
      log: jest.fn(),
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
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
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
          sizeBytes: 1024,
        },
        { user: { id: 'user123' } },
      );

      expect(result).toEqual({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });
      expect(service.initUpload).toHaveBeenCalledWith('user123', {
        mime: 'application/pdf',
        sha256: 'a'.repeat(64),
        sizeBytes: 1024,
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
          sizeBytes: 512,
        },
        { user: { id: 'user456' } },
      );

      expect(result).toEqual({
        documentId: mockDocumentId,
        signedUrl: mockUrl,
      });
    });
  });
});
