import { Injectable, Logger } from '@nestjs/common';
import { AttendanceValidationRequest, RabbitMQAsyncService } from 'src/rabbitmq/rabbitmq-client.service';
import { AttendanceDocument } from '../entities/attendance.entity';
import { AttendanceDateTimeHelper } from './attendance-date-time.helper';
import { MongoDBIdHelper } from './mongodb-id.helper';

interface NotificationResult {
  success: boolean;
  message: string;
  error?: any;
}

@Injectable()
export class RabbitMQNotificationHelper {
  private readonly logger = new Logger(RabbitMQNotificationHelper.name);

  constructor(
    private readonly rabbitMQService: RabbitMQAsyncService,
    private readonly dateTimeHelper: AttendanceDateTimeHelper,
  ) {}

  /**
   * Envia una solicitud de validación de asistencia a RabbitMQ.
   */
  async sendValidationRequest(attendance: AttendanceDocument): Promise<NotificationResult> {
    try {
      const validationRequest = this.buildValidationRequest(attendance);

      await this.rabbitMQService.requestEmployeeValidation(validationRequest);

      const attendanceId = MongoDBIdHelper.getId(attendance);
      const successMessage = `🐰 Solicitud enviada a RabbitMQ: ${attendanceId}`;
      this.logger.log(successMessage);

      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      const errorMessage = `❌ Error enviando a RabbitMQ: ${error.message}`;
      this.logger.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
        error,
      };
    }
  }

  /**
   * Construye el objeto de solicitud de validación para RabbitMQ.
   */
  private buildValidationRequest(attendance: AttendanceDocument): AttendanceValidationRequest {
    return {
      attendanceId: MongoDBIdHelper.getId(attendance),
      employeeId: attendance.employee_id,
      type: attendance.type,
      timestamp: this.dateTimeHelper.getCurrentTimestamp(),
    };
  }

  handleNotificationError(attendance: AttendanceDocument, error: any): void {
    this.logger.error(`🚨 Error crítico en notificación para asistencia ${attendance.id}:`, {
      attendanceId: attendance.id,
      employeeId: attendance.employee_id,
      type: attendance.type,
      error: error.message,
      stack: error.stack,
    });
  }
}
