import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONFIG, RABBITMQ_QUEUES } from './config/rabbitmq.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Asistencia API')
    .setDescription('API para la gestión de asistencias de empleados')
    .setVersion('1.0')
    .addTag('attendance', 'Operaciones de asistencia')
    .addBearerAuth()
    .addServer('http://localhost:3002', 'Servidor de Desarrollo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Attendance API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3002;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: RABBITMQ_CONFIG.urls,
      queue: RABBITMQ_QUEUES.ATTENDANCE_RESPONSES,
      queueOptions: RABBITMQ_CONFIG.queueOptions,
      socketOptions: RABBITMQ_CONFIG.socketOptions,
    },
  });

  await app.startAllMicroservices();
  console.log('🐰 Microservicio RabbitMQ listener iniciado para respuestas');

  await app.listen(port);

  console.log(`🚀 Microservicio B corriendo en puerto ${port}`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});