import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQAsyncService } from './rabbitmq-client.service';
import { RABBITMQ_CONFIG, RABBITMQ_QUEUES } from '../config/rabbitmq.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: RABBITMQ_CONFIG.urls,
          queue: RABBITMQ_QUEUES.EMPLOYEE_VALIDATION,
          queueOptions: RABBITMQ_CONFIG.queueOptions,
          socketOptions: RABBITMQ_CONFIG.socketOptions,
        },
      },
    ]),
  ],
  providers: [RabbitMQAsyncService],
  exports: [RabbitMQAsyncService],
})
export class RabbitMQModule {}