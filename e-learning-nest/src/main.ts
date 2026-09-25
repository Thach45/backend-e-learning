import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLogger } from './shared/service/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // SIGTERM (docker stop / deploy): đóng worker BullMQ êm để job đang gửi dở không bị bỏ giữa chừng
  app.enableShutdownHooks();
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  const httpAdapter = app.getHttpAdapter();
  const httpServer = httpAdapter.getInstance();
  // Sau nginx của VPS và nginx trong docker: tin các dải IP nội bộ để req.ip là IP thật của khách (throttle, audit log).
  httpServer.set('trust proxy', 'loopback, linklocal, uniquelocal');

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('U Đê Mê E-Learning API')
      .setDescription('Tài liệu API cho nền tảng học trực tuyến U Đê Mê')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  app.useLogger(app.get(AppLogger));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
