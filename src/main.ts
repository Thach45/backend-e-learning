import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './shared/service/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const httpAdapter = app.getHttpAdapter();
  const httpServer = httpAdapter.getInstance();
  httpServer.set('trust proxy', 'loopback');

  app.useLogger(app.get(AppLogger));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
