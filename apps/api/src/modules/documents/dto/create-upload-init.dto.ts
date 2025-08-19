import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUploadInitDto {
  @ApiProperty({
    description: 'Name of the file to upload',
    example: 'resume.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024000,
  })
  @IsOptional()
  fileSize?: number;
}
