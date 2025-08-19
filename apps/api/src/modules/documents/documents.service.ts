import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Document, DocumentType } from '@prisma/client';
import { ProviderRegistry } from '@ai-career/providers';
import { CreateUploadInit, UploadInitResponse } from '@ai-career/shared';
import { QueuesService } from '../queues/queues.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private providers: ProviderRegistry,
    private queues: QueuesService,
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
      },
    });

    const signedUrl = await this.providers.storage.getSignedUrl(storageKey, 'PUT');

    return {
      documentId: document.id,
      signedUrl,
    };
  }

  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateType(id: string, type: DocumentType): Promise<Document> {
    return this.prisma.document.update({
      where: { id },
      data: { type },
    });
  }

  async delete(id: string): Promise<Document> {
    const document = await this.prisma.document.delete({
      where: { id },
    });

    // Clean up storage
    try {
      await this.providers.storage.deleteObject(document.storageKey);
    } catch (error) {
      console.warn('Failed to delete storage object:', error);
    }

    return document;
  }

  async triggerParsing(documentId: string): Promise<void> {
    const document = await this.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    await this.queues.addParseJob({
      documentId: document.id,
      userId: document.userId,
      filePath: document.storageKey,
      mimeType: document.mime,
    });
  }
}