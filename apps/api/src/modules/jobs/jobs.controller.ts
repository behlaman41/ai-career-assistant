import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { JobsService } from './jobs.service';

class CreateJobDto {
  title!: string;
  company!: string;
  documentId!: string;
}

class UpdateJobDto {
  title?: string;
  company?: string;
  documentId?: string;
}

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create job', description: 'Create a new job description for analysis' })
  @ApiBody({ description: 'Job creation data' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  create(@Request() req: any, @Body() createJobDto: CreateJobDto) {
    const userId = req.user.id;
    return this.jobsService.create(userId, createJobDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user jobs', description: 'Retrieve all jobs for a specific user' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  findAll(@Request() req: any) {
    const userId = req.user.id;
    return this.jobsService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get job by ID', description: 'Retrieve a specific job description' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.jobsService.findById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    const userId = req.user.id;
    return this.jobsService.update(id, userId, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.jobsService.delete(id, userId);
  }
}
