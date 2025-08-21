import { ProviderRegistry } from '@ai-career/providers';
import { CreateUploadInit, UploadInitResponse, assertOwnership } from '@ai-career/shared';
import { Injectable } from '@nestjs/common';
import { Document, DocumentType, UploadStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private providers: ProviderRegistry,
    private queues: QueuesService,
    private auditService: AuditService,
  ) {}

  async initUpload(userId: string, data: CreateUploadInit): Promise<UploadInitResponse> {
    // Check if document with same hash already exists for user
    const existing = await this.prisma.document.findUnique({
      where: {
        userId_sha256: {
          userId,
          sha256: data.sha256,
        },
      },
    });

    if (existing) {
      // Return existing document
      const signedUrl = await this.providers.storage.getSignedUrl(existing.storageKey, 'PUT');
      return {
        documentId: existing.id,
        signedUrl,
      };
    }

    // Create new document record
    const documentId = uuidv4();
    const storageKey = `documents/${userId}/${documentId}`;

    const document = await this.prisma.document.create({
      data: {
        id: documentId,
        userId,
        type: 'resume' as DocumentType, // Default, will be updated based on usage
        storageKey,
        mime: data.mime,
        sha256: data.sha256,
        sizeBytes: data.sizeBytes,
        status: UploadStatus.pending,
      },
    });

    const signedUrl = await this.providers.storage.getSignedUrl(storageKey, 'PUT');

    await this.auditService.log(userId, 'document_upload_initiated', {
      documentId,
      type: 'resume',
      mime: data.mime,
      sizeBytes: data.sizeBytes,
    });

    return {
      documentId: document.id,
      signedUrl,
    };
  }

  async finalizeUpload(documentId: string, userId: string): Promise<void> {
    const document = await this.findById(documentId, userId);
    if (!document) {
      throw new Error('Document not found');
    }
    if (document.status !== UploadStatus.pending) {
      throw new Error('Invalid status for finalization');
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: UploadStatus.scanning },
    });

    // Queue AV scan job (stub to be implemented)
    await this.queues.addAVScanJob({
      documentId,
      storageKey: document.storageKey,
    });

    await this.auditService.log(userId, 'document_upload_finalized', { documentId });
  }

  async findById(id: string, userId: string): Promise<Document | null> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    if (document) {
      assertOwnership(userId, document.userId);
    }
    return document;
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateType(id: string, type: DocumentType, userId: string): Promise<Document> {
    const document = await this.findById(id, userId);
    if (!document) throw new Error('Document not found');
    const updated = await this.prisma.document.update({
      where: { id },
      data: { type },
    });
    await this.auditService.log(userId, 'document_type_updated', { documentId: id, newType: type });
    return updated;
  }

  async delete(id: string, userId: string): Promise<Document> {
    await this.findById(id, userId); // Asserts ownership
    const document = await this.prisma.document.delete({
      where: { id },
    });

    // Clean up storage
    try {
      await this.providers.storage.deleteObject(document.storageKey);
    } catch (error) {
      console.warn('Failed to delete storage object:', error);
    }

    await this.auditService.log(userId, 'document_deleted', { documentId: id });

    return document;
  }

  async triggerParsing(documentId: string, userId: string): Promise<void> {
    const document = await this.findById(documentId, userId);
    if (!document) {
      throw new Error('Document not found');
    }

    await this.queues.addParseJob({
      documentId: document.id,
      userId: document.userId,
      filePath: document.storageKey,
      mimeType: document.mime,
    });

    await this.auditService.log(userId, 'document_parsing_triggered', { documentId });
  }
}
