import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './entities/attendance.entity';
import { AttendanceDateTimeHelper } from './helpers/attendance-date-time.helper';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  lastEntry?: Attendance;
}

interface AttendanceContext {
  employeeId: string;
  date: string;
  type: 'entry' | 'exit';
  excludeId?: string;
}

interface WorkingHours {
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

@Injectable()
export class AttendanceValidationService {

  private readonly workingHours: WorkingHours = {
    start: { hour: 8, minute: 0 },
    end: { hour: 17, minute: 0 },
  };

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    private readonly dateTimeHelper: AttendanceDateTimeHelper,
  ) {}

  async validateAttendanceRules(context: AttendanceContext, requestTime?: string): Promise<ValidationResult> {
    const timeValidation = this.validateWorkingHours(requestTime);

    if (!timeValidation.isValid) {
      return timeValidation;
    }

    const lastEntry = await this.getLastAttendanceForDate(context.employeeId, context.date, context.excludeId);

    if (context.type === 'entry') {
      return this.validateEntrada(lastEntry ?? undefined);
    } else {
      return this.validateSalida(lastEntry ?? undefined, context.employeeId, context.date, requestTime);
    }
  }

  // * Validar si la hora de registro está dentro del horario laboral.

  validateWorkingHours(requestTime?: string): ValidationResult {
    const currentTime = requestTime || new Date().toTimeString().split(' ')[0];
    const time = this.dateTimeHelper.parseTime(currentTime);

    const startTime = new Date();
    startTime.setHours(this.workingHours.start.hour, this.workingHours.start.minute, 0, 0);

    const endTime = new Date();
    endTime.setHours(this.workingHours.end.hour, this.workingHours.end.minute, 0, 0);

    if (time < startTime) {
      return {
        isValid: false,
        message:
          `No se pueden registrar asistencias antes de las ${this.dateTimeHelper.formatTime(startTime)}. ` +
          `Hora actual: ${currentTime}. ` +
          `El horario laboral es de ${this.dateTimeHelper.formatTime(startTime)} a ${this.dateTimeHelper.formatTime(endTime)}.`,
      };
    }

    if (time > endTime) {
      return {
        isValid: false,
        message:
          `No se pueden registrar asistencias después de las ${this.dateTimeHelper.formatTime(endTime)}. ` +
          `Hora actual: ${currentTime}. ` +
          `El horario laboral es de ${this.dateTimeHelper.formatTime(startTime)} a ${this.dateTimeHelper.formatTime(endTime)}.`,
      };
    }

    return {
      isValid: true,
      message: `Registro dentro del horario laboral (${this.dateTimeHelper.formatTime(startTime)} - ${this.dateTimeHelper.formatTime(endTime)})`,
    };
  }

  private validateEntrada(lastEntry?: Attendance): ValidationResult {
    if (lastEntry && lastEntry.type === 'entry') {
      return {
        isValid: false,
        message:
          `No se pueden registrar dos entradas consecutivas. ` +
          `Última entrada registrada a las ${lastEntry.time}. ` +
          `Debe registrar una salida antes de una nueva entrada.`,
        lastEntry,
      };
    }

    return {
      isValid: true,
      message: lastEntry ? `Entrada válida después de salida a las ${lastEntry.time}` : 'Primera entrada del día',
      lastEntry,
    };
  }

  private validateSalida(
    lastEntry?: Attendance,
    employeeId?: string,
    date?: string,
    requestTime?: string,
  ): ValidationResult {
    if (!lastEntry) {
      return {
        isValid: false,
        message:
          'No se puede registrar una salida sin una entrada previa en el día. ' + 'Debe registrar primero una entrada.',
      };
    }

    // No puede haber dos salidas consecutivas
    if (lastEntry.type === 'exit') {
      return {
        isValid: false,
        message:
          `No se pueden registrar dos salidas consecutivas. ` +
          `Última salida registrada a las ${lastEntry.time}. ` +
          `Debe registrar una entrada antes de una nueva salida.`,
        lastEntry,
      };
    }

    // Validar que la salida sea después de la entrada (mismo día)
    if (lastEntry.type === 'entry') {
      const entryTime = this.dateTimeHelper.parseTime(lastEntry.time);
      const exitTime = requestTime
        ? this.dateTimeHelper.parseTime(requestTime)
        : this.dateTimeHelper.parseTime(new Date().toTimeString().split(' ')[0]);

      if (exitTime <= entryTime) {
        return {
          isValid: false,
          message:
            `La hora de salida (${this.dateTimeHelper.formatTimeFromDate(exitTime)}) ` +
            `no puede ser anterior o igual a la hora de entrada (${lastEntry.time.substring(0, 5)}).`,
          lastEntry,
        };
      }
    }

    return {
      isValid: true,
      message: `Salida válida después de entrada a las ${lastEntry.time.substring(0, 5)}`,
      lastEntry,
    };
  }

  async validateExistingAttendance(id: string, updateDto: any): Promise<ValidationResult> {
    const attendance = await this.attendanceModel.findById(id);

    if (!attendance) {
      return { isValid: false, message: 'Asistencia no encontrada' };
    }

    // Solo validar si se está cambiando el tipo, fecha o hora
    if (updateDto.type && updateDto.type !== attendance.type) {
      return this.validateAttendanceRules(
        {
          employeeId: attendance.employee_id,
          date: updateDto.date || attendance.date,
          type: updateDto.type,
          excludeId: id,
        },
        updateDto.time || attendance.time,
      );
    }

    // Validar cambio de hora
    if (updateDto.time && updateDto.time !== attendance.time) {
      const timeValidation = this.validateWorkingHours(updateDto.time);
      if (!timeValidation.isValid) {
        return timeValidation;
      }
    }

    return { isValid: true, message: 'Actualización válida' };
  }

  async getLastAttendanceForDate(employeeId: string, date: string, excludeId?: string): Promise<Attendance | null> {
    const query: any = {
      employee_id: employeeId,
      date: date,
      status: { $in: ['validated', 'pending'] },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const lastEntry = await this.attendanceModel.findOne(query).sort({ time: -1 }).exec();

    return lastEntry;
  }
}
