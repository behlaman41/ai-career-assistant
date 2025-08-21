import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { ResumesService } from './resumes.service';

class CreateResumeDto {
  title!: string;
  documentId!: string;
}

class UpdateResumeDto {
  title?: string;
}

class CreateResumeVersionDto {
  documentId?: string;
  fromRunId?: string;
}

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create resume',
    description: 'Create a new resume from an uploaded document',
  })
  @ApiBody({ description: 'Resume creation data' })
  @ApiResponse({ status: 201, description: 'Resume created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  create(@Request() req: any, @Body() createResumeDto: CreateResumeDto) {
    const userId = req.user.id;
    return this.resumesService.create(userId, createResumeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user resumes',
    description: 'Retrieve all resumes for a specific user',
  })
  @ApiResponse({ status: 200, description: 'Resumes retrieved successfully' })
  findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.resumesService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get resume by ID',
    description: 'Retrieve a specific resume with its versions',
  })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 200, description: 'Resume retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.resumesService.findById(id, userId);
  }

  @Post(':id/versions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create resume version',
    description: 'Create a new version of an existing resume',
  })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiBody({ description: 'Resume version creation data' })
  @ApiResponse({ status: 201, description: 'Resume version created successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  createVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() createVersionDto: CreateResumeVersionDto,
  ) {
    const userId = req.user.id;
    return this.resumesService.createVersion(id, userId, createVersionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update resume', description: 'Update resume details' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiBody({ description: 'Resume update data' })
  @ApiResponse({ status: 200, description: 'Resume updated successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto) {
    const userId = req.user.id;
    return this.resumesService.update(id, userId, updateResumeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete resume', description: 'Delete a resume and all its versions' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 200, description: 'Resume deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.resumesService.delete(id, userId);
  }
}
