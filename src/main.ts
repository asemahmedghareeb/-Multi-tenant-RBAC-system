import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const startTime = Date.now();

  const app = await NestFactory.create(AppModule);
  mongoose.set('transactionAsyncLocalStorage', true);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('RBAC API')
    .setDescription('API for testing')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log(`🚀 API documentation: http://localhost:${port}/api-docs`);
    console.log(
      `⏱️  Total startup time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`,
    );
  });
}
bootstrap();
