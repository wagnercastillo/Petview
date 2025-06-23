import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONFIG, RABBITMQ_QUEUES } from 'src/config/rabbitmq.config';
import { EmployeeValidationHandler } from './handlers/employee-validation.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_RESPONSE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: RABBITMQ_CONFIG.urls,
          queue: RABBITMQ_QUEUES.ATTENDANCE_RESPONSES,
          queueOptions: RABBITMQ_CONFIG.queueOptions,
        },
      },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeeValidationHandler],
  exports: [TypeOrmModule, EmployeesService],
})
export class EmployeesModule {}
