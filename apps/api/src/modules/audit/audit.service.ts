import { Injectable } from '@nestjs/common';
import { AuditLog } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, meta: any): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        meta,
      },
    });
  }

  async findByUser(userId: string, take: number = 20, skip: number = 0): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async findAll(take: number = 50, skip: number = 0, userId?: string): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
