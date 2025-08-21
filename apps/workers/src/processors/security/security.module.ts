import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../../prisma/prisma.module'; // Assuming we add this
import { ProvidersModule } from '../../providers/providers.module';
import { AVScanProcessor } from './avscan.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'security.avscan',
    }),
    PrismaModule,
    ProvidersModule,
  ],
  providers: [AVScanProcessor],
})
export class SecurityModule {}
