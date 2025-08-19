import { Module } from '@nestjs/common';
import { ProviderRegistry } from '@ai-career/providers';

@Module({
  providers: [
    {
      provide: ProviderRegistry,
      useFactory: () => {
        return new ProviderRegistry();
      },
    },
  ],
  exports: [ProviderRegistry],
})
export class ProvidersModule {}