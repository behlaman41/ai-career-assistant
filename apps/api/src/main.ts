import 'reflect-metadata';
// Initialize OpenTelemetry before any other imports
import { initializeTracing } from './common/telemetry/tracing';
initializeTracing();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('AI Career Assistant API')
    .setDescription('API for AI-powered resume optimization and job matching')
    .setVersion('1.0')
    .addTag('documents', 'Document upload and management')
    .addTag('resumes', 'Resume management and versions')
    .addTag('jobs', 'Job description management')
    .addTag('runs', 'Analysis runs and results')
    .addTag('users', 'User management')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();