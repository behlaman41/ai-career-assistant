import { ApiProperty } from '@nestjs/swagger';

export class UploadInitResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the document',
    example: 'doc_123456789',
  })
  documentId!: string;

  @ApiProperty({
    description: 'Pre-signed URL for uploading the file',
    example: 'https://s3.amazonaws.com/bucket/path?signature=...',
  })
  uploadUrl!: string;

  @ApiProperty({
    description: 'Expiration time of the upload URL in ISO format',
    example: '2024-01-01T12:00:00Z',
  })
  expiresAt!: string;
}
