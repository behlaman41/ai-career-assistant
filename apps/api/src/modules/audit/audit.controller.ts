import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('admin/logs')
  @Roles('admin' as Role)
  @ApiOperation({
    summary: 'Get all audit logs (Admin only)',
    description: 'Retrieve system-wide audit logs for administrative purposes',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of logs to return (default 50)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of logs to skip (default 0)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by specific user ID',
  })
  @ApiResponse({ status: 200, description: 'System audit logs retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAdminLogs(
    @Query('take') take: string = '50',
    @Query('skip') skip: string = '0',
    @Query('userId') userId?: string,
  ) {
    return this.auditService.findAll(parseInt(take), parseInt(skip), userId);
  }
}
