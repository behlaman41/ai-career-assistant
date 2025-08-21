import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';

import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Get user audit logs',
    description: 'Retrieve recent audit logs for the authenticated user',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of logs to return (default 20)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of logs to skip (default 0)',
  })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getLogs(
    @Req() req: any,
    @Query('take') take: string = '20',
    @Query('skip') skip: string = '0',
  ) {
    const userId = req.user.id;
    return this.auditService.findByUser(userId, parseInt(take), parseInt(skip));
  }
}
