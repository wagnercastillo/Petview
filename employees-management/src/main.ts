import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONFIG, RABBITMQ_QUEUES } from './config/rabbitmq.config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle('Empleados API')
      .setDescription('API para gestión de empleados con validación de asistencia')
      .setVersion('1.0')
      .addTag('empleados', 'Operaciones relacionadas con empleados')
      .addServer('http://localhost:3001', 'Servidor de desarrollo')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Empleados API - Documentación',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
      }),
    );

    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: RABBITMQ_CONFIG.urls,
        queue: RABBITMQ_QUEUES.EMPLOYEE_VALIDATION,
        queueOptions: RABBITMQ_CONFIG.queueOptions,
      },
    });

    await app.startAllMicroservices();
    console.log('🐰 Microservicio RabbitMQ iniciado');

    const port = configService.get('PORT') || 3001;
    await app.listen(port, '0.0.0.0');

    console.log(`✅ ¡Aplicación iniciada exitosamente!`);
    console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
    console.log(`📚 API disponible en: http://localhost:${port}/api/v1`);
    console.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
    console.log(`🐘 PostgreSQL Host: ${configService.get('DATABASE_HOST')}`);
  } catch (error) {
    console.error('❌ === ERROR CRÍTICO AL INICIAR ===');
    console.error('Error completo:', error);
    process.exit(1);
  }
}

bootstrap()