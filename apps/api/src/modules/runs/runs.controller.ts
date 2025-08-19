import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { RunsService } from './runs.service';

class CreateRunDto {
  jdId!: string;
  resumeVersionId!: string;
}

@ApiTags('runs')
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create analysis run',
    description: 'Start a new resume analysis run against a job description',
  })
  @ApiBody({ description: 'Analysis run creation data' })
  @ApiResponse({ status: 201, description: 'Analysis run created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  create(
    @Request() req: ExpressRequest & { user?: { id: string } },
    @Body() createRunDto: CreateRunDto,
  ) {
    const userId = req.user?.id || 'temp-user-id'; // TODO: Get from auth
    return this.runsService.create(userId, createRunDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user analysis runs',
    description: 'Retrieve all analysis runs for a specific user',
  })
  @ApiResponse({ status: 200, description: 'Analysis runs retrieved successfully' })
  findAll(@Request() req: ExpressRequest & { user?: { id: string } }) {
    const userId = req.user?.id || 'temp-user-id'; // TODO: Get from auth
    return this.runsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get analysis run',
    description: 'Retrieve a specific analysis run with its results',
  })
  @ApiParam({ name: 'id', description: 'Run ID' })
  @ApiResponse({ status: 200, description: 'Analysis run retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Analysis run not found' })
  findOne(@Request() req: ExpressRequest & { user?: { id: string } }, @Param('id') id: string) {
    const userId = req.user?.id || 'temp-user-id'; // TODO: Get from auth
    return this.runsService.findById(id, userId);
  }
}
