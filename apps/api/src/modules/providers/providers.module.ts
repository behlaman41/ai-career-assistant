import { ProviderRegistry } from '@ai-career/providers';
import { Module } from '@nestjs/common';

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
