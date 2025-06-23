import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_ROUTING_KEYS } from '../config/rabbitmq.config';

export interface AttendanceValidationRequest {
  attendanceId: string;
  employeeId: string;
  type: 'entry' | 'exit';
  timestamp: string;
  retryCount?: number;
}

export interface EmployeeValidationResponse {
  attendanceId: string;
  isValid: boolean;
  employeeId: string;
  employeeName?: string;
  message?: string;
  timestamp: string;
}

@Injectable()
export class RabbitMQAsyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQAsyncService.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('🐰 Conectado a RabbitMQ - Modo Asíncrono');
    } catch (error) {
      this.logger.error('❌ Error conectando a RabbitMQ:', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async requestEmployeeValidation(request: AttendanceValidationRequest): Promise<void> {
    try {
      this.logger.log(`📤 Enviando validación asíncrona: ${request.attendanceId}`);
      
      this.client.emit(RABBITMQ_ROUTING_KEYS.VALIDATE_EMPLOYEE, request);
      
      this.logger.log(`✅ Solicitud enviada a cola: ${request.attendanceId}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando validación: ${error.message}`);
      throw error;
    }
  }
}