import { CreateUploadInit, UploadInitResponse } from '@ai-career/shared';
import { Controller, Post, Get, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Document } from '@prisma/client';

import { DocumentsService } from './documents.service';
import { CreateUploadInitDto } from './dto/create-upload-init.dto';
import { UploadInitResponseDto } from './dto/upload-init-response.dto';

@ApiTags('documents')
@Controller()
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('uploads/init')
  @ApiOperation({
    summary: 'Initialize file upload',
    description: 'Get a signed URL for uploading a document',
  })
  @ApiBody({ type: CreateUploadInitDto })
  @ApiQuery({ name: 'userId', description: 'User ID (temporary until auth is implemented)' })
  @ApiResponse({
    status: 201,
    description: 'Upload initialized successfully',
    type: UploadInitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async initUpload(
    @Body() createUploadInit: CreateUploadInit,
    @Query('userId') userId: string, // TODO: Replace with auth user in Phase 2
  ): Promise<UploadInitResponse> {
    return this.documentsService.initUpload(userId, createUploadInit);
  }

  @Get('documents')
  @ApiOperation({
    summary: 'Get user documents',
    description: 'Retrieve all documents for a specific user',
  })
  @ApiQuery({ name: 'userId', description: 'User ID (temporary until auth is implemented)' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findByUser(
    @Query('userId') userId: string, // TODO: Replace with auth user in Phase 2
  ): Promise<Document[]> {
    return this.documentsService.findByUser(userId);
  }

  @Get('documents/:id')
  @ApiOperation({
    summary: 'Get document by ID',
    description: 'Retrieve a specific document by its ID',
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id') id: string): Promise<Document | null> {
    return this.documentsService.findById(id);
  }

  @Delete('documents/:id')
  @ApiOperation({
    summary: 'Delete document',
    description: 'Delete a document and its associated files',
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(@Param('id') id: string): Promise<Document> {
    return this.documentsService.delete(id);
  }
}
