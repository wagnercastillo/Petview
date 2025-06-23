import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { Attendance, AttendanceDocument } from '../entities/attendance.entity';
import { AttendanceDateTimeHelper } from './attendance-date-time.helper';

interface AttendanceCreationData {
  dto: CreateAttendanceDto;
  date: string;
  time: string;
  status?: 'pending' | 'validated' | 'rejected';
  validationNotes?: string;
  additionalFields?: Partial<Attendance>;
}

@Injectable()
export class AttendanceCreationHelper {
  private readonly logger = new Logger(AttendanceCreationHelper.name);

  constructor(private readonly dateTimeHelper: AttendanceDateTimeHelper) {}

  prepareAttendanceData(createAttendanceDto: CreateAttendanceDto): AttendanceCreationData {
    const { date, time } = this.dateTimeHelper.normalizeDateTime(createAttendanceDto.date, createAttendanceDto.time);

    return {
      dto: createAttendanceDto,
      date,
      time,
      status: 'pending',
      validationNotes: 'Pendiente de validación de empleado',
    };
  }

  buildAttendanceObject(attendanceModel: Model<AttendanceDocument>, data: AttendanceCreationData): AttendanceDocument {
    const attendanceData = {
      ...data.dto,
      status: data.status || 'pending',
      date: data.date,
      time: data.time,
      validation_notes: data.validationNotes || 'Pendiente de validación',
      ...data.additionalFields,
    };

    return new attendanceModel(attendanceData);
  }

  async saveAttendanceWithLogging(attendanceRecord: AttendanceDocument): Promise<AttendanceDocument> {
    const savedAttendance = await attendanceRecord.save();
    this.logger.log(`📝 Asistencia creada en estado ${savedAttendance.status.toUpperCase()}: ${savedAttendance._id}`);
    return savedAttendance;
  }

  prepareForceCreationData(createAttendanceDto: CreateAttendanceDto, adminNote: string): AttendanceCreationData {
    const { date, time } = this.dateTimeHelper.normalizeDateTime(createAttendanceDto.date, createAttendanceDto.time);

    return {
      dto: createAttendanceDto,
      date,
      time,
      status: 'validated',
      validationNotes: `ADMIN OVERRIDE: ${adminNote}`,
      additionalFields: {
        validated_at: new Date(),
      },
    };
  }

  createValidationContext(data: AttendanceCreationData) {
    return {
      employeeId: data.dto.employee_id,
      date: data.date,
      type: data.dto.type,
    };
  }

  validateInputData(createAttendanceDto: CreateAttendanceDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar employee_id
    if (!createAttendanceDto.employee_id || createAttendanceDto.employee_id.trim() === '') {
      errors.push('employee_id es requerido');
    }

    // Validar type
    if (!createAttendanceDto.type || !['entry', 'exit'].includes(createAttendanceDto.type)) {
      errors.push('type debe ser "entry" o "exit"');
    }

    // Validar formato de fecha si se proporciona
    if (createAttendanceDto.date && !this.dateTimeHelper.isValidDateFormat(createAttendanceDto.date)) {
      errors.push('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    // Validar formato de hora si se proporciona
    if (createAttendanceDto.time && !this.dateTimeHelper.isValidTimeFormat(createAttendanceDto.time)) {
      errors.push('Formato de hora inválido. Use HH:MM o HH:MM:SS');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  createOperationSummary(attendance: Attendance): string {
    return (
      `Asistencia ${attendance.type} para empleado ${attendance.employee_id} ` +
      `el ${attendance.date} a las ${attendance.time} - Estado: ${attendance.status}`
    );
  }
}
