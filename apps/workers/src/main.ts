// Initialize OpenTelemetry before any other imports
import { initializeTracing } from './common/telemetry/tracing';
initializeTracing();

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('WorkersBootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Enable graceful shutdown
    app.enableShutdownHooks();

    await app.init();
    logger.log('Workers application started successfully');

    // Keep the process running
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start workers application', error);
    process.exit(1);
  }
}

bootstrap();
