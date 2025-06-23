import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeValidationResponse } from 'src/rabbitmq/rabbitmq-client.service';
import { Attendance, AttendanceDocument } from 'src/attendance/entities/attendance.entity';
import { AttendanceValidationService } from 'src/attendance/attendance-validation.service';
import { MongoDBIdHelper } from '../mongodb-id.helper';

interface ValidationProcessingResult {
  success: boolean;
  attendanceId: string;
  finalStatus: 'validated' | 'rejected';
  message: string;
  error?: any;
}

interface AttendanceUpdateData {
  status: 'validated' | 'rejected';
  employee_name?: string;
  validated_at?: Date;
  rejection_reason?: string;
  validation_notes: string;
}

@Injectable()
export class ValidationResponseProcessor {
  private readonly logger = new Logger(ValidationResponseProcessor.name);

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    private readonly validationService: AttendanceValidationService,
  ) {}

  async processValidationResponse(response: EmployeeValidationResponse): Promise<ValidationProcessingResult> {
    try {
      this.logger.log(`📥 Procesando respuesta para: ${response.attendanceId}`);

      // 1. BUSCAR ASISTENCIA
      const attendance = await this.findAttendanceById(response.attendanceId);
      if (!attendance) {
        return this.createErrorResult(response.attendanceId, 'Asistencia no encontrada');
      }

      // 2. PROCESAR VALIDACIÓN
      const updateData = await this.processEmployeeValidation(response, attendance);

      // 3. ACTUALIZAR ASISTENCIA
      await this.updateAttendanceRecord(attendance, updateData);

      // 4. LOG Y RESULTADO
      const successMessage = `🔄 Asistencia ${response.attendanceId} actualizada a: ${updateData.status}`;
      this.logger.log(successMessage);

      return {
        success: true,
        attendanceId: response.attendanceId,
        finalStatus: updateData.status,
        message: successMessage,
      };
    } catch (error) {
      const errorMessage = `❌ Error procesando respuesta: ${error.message}`;
      this.logger.error(errorMessage);

      return {
        success: false,
        attendanceId: response.attendanceId,
        finalStatus: 'rejected',
        message: errorMessage,
        error,
      };
    }
  }

  private async findAttendanceById(attendanceId: string): Promise<AttendanceDocument | null> {
    try {
      const attendance = await this.attendanceModel.findById(attendanceId);

      if (!attendance) {
        this.logger.error(`❌ Asistencia no encontrada: ${attendanceId}`);
        return null;
      }

      return attendance;
    } catch (error) {
      this.logger.error(`❌ Error buscando asistencia ${attendanceId}: ${error.message}`);
      return null;
    }
  }

  private async processEmployeeValidation(
    response: EmployeeValidationResponse,
    attendance: AttendanceDocument,
  ): Promise<AttendanceUpdateData> {
    if (!response.isValid) {
      return this.createRejectedEmployeeUpdate(response);
    }
    return await this.processAttendanceRulesValidation(response, attendance);
  }

  private async processAttendanceRulesValidation(
    response: EmployeeValidationResponse,
    attendance: AttendanceDocument,
  ): Promise<AttendanceUpdateData> {
    const attendanceId = MongoDBIdHelper.getId(attendance);
    const finalValidation = await this.validationService.validateAttendanceRules(
      {
        employeeId: attendance.employee_id,
        date: attendance.date,
        type: attendance.type,
        excludeId: attendanceId,
      },
      attendance.time,
    );

    if (!finalValidation.isValid) {
      this.logger.log(`❌ Asistencia ${response.attendanceId} rechazada por reglas: ${finalValidation.message}`);

      return {
        status: 'rejected',
        rejection_reason: finalValidation.message,
        validation_notes: 'Empleado válido, pero falló validación de reglas de asistencia',
      };
    }

    this.logger.log(`✅ Asistencia ${response.attendanceId} VALIDADA completamente`);

    return {
      status: 'validated',
      employee_name: response.employeeName,
      validated_at: new Date(),
      validation_notes: finalValidation.message || 'Validación completa exitosa',
    };
  }

  private createRejectedEmployeeUpdate(response: EmployeeValidationResponse): AttendanceUpdateData {
    this.logger.log(`❌ Asistencia ${response.attendanceId} RECHAZADA: ${response.message}`);

    return {
      status: 'rejected',
      rejection_reason: response.message || 'Empleado no válido',
      validation_notes: 'Falló validación de empleado',
    };
  }

  private async updateAttendanceRecord(
    attendance: AttendanceDocument,
    updateData: AttendanceUpdateData,
  ): Promise<void> {
    Object.assign(attendance, updateData);
    await attendance.save();
  }

  private createErrorResult(attendanceId: string, message: string): ValidationProcessingResult {
    return {
      success: false,
      attendanceId,
      finalStatus: 'rejected',
      message,
    };
  }
}
