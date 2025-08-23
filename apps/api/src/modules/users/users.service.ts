import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { email: string; name?: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });

    await this.auditService.log(user.id, 'user_created', {
      email: user.email,
      name: user.name,
    });

    return user;
  }

  async update(id: string, data: { name?: string }): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    await this.auditService.log(id, 'user_updated', {
      changes: data,
    });

    return user;
  }

  async delete(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    await this.auditService.log(id, 'user_deleted', {
      email: user.email,
      name: user.name,
    });

    return deletedUser;
  }
}
