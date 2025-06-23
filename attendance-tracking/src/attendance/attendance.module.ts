import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { AttendanceValidationService } from './attendance-validation.service';
import { AttendanceQueryService } from './attendance-query.service';
import { AttendanceCreationHelper } from './helpers/attendance-creation.helper';
import { RabbitMQNotificationHelper } from './helpers/rabbitmq-notification.helper';
import { AttendanceDateTimeHelper } from './helpers/attendance-date-time.helper';
import { ValidationResponseProcessor } from './helpers/rabbitmq/validation-response-processor.helper';

@Module({
  imports: [MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]), RabbitMQModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceValidationService,
    AttendanceQueryService,
    AttendanceCreationHelper,
    RabbitMQNotificationHelper,
    AttendanceDateTimeHelper,
    ValidationResponseProcessor
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
