import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://192.168.1.76:5173'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
