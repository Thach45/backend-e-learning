import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './shared/service/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const httpAdapter = app.getHttpAdapter();
  const httpServer = httpAdapter.getInstance();
  httpServer.set('trust proxy', 'loopback');

  app.useLogger(app.get(AppLogger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
