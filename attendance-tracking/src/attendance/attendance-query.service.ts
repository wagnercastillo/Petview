import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './entities/attendance.entity';

export interface DailySummary {
  date: string;
  employeeId: string;
  summary: {
    totalEntries: number;
    totalExits: number;
    pendingRecords: number;
    rejectedRecords: number;
    isCurrentlyWorking: boolean;
    totalWorkedTime: string;
    totalWorkedMinutes: number;
  };
  records: Attendance[];
}

export interface AttendanceStats {
  pending: number;
  validated: number;
  rejected: number;
}

@Injectable()
export class AttendanceQueryService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async findAll(): Promise<Attendance[]> {
    return this.attendanceModel.find().exec();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    return attendance;
  }

  async findByEmployee(employeeId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ employee_id: employeeId }).exec();
  }

  async findByDate(date: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ date }).exec();
  }

  async findByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({
        employee_id: employeeId,
        date,
      })
      .exec();
  }

  async findByStatus(status: 'pending' | 'validated' | 'rejected'): Promise<Attendance[]> {
    return this.attendanceModel.find({ status }).exec();
  }

  async getAttendancesByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({
        employee_id: employeeId,
        date: date,
      })
      .sort({ time: 1 }) 
      .exec();
  }

  async getPendingAttendances(): Promise<Attendance[]> {
    return this.attendanceModel.find({ status: 'pending' }).sort({ createdAt: -1 });
  }

  async getAttendanceStats(): Promise<AttendanceStats> {
    const [pending, validated, rejected] = await Promise.all([
      this.attendanceModel.countDocuments({ status: 'pending' }),
      this.attendanceModel.countDocuments({ status: 'validated' }),
      this.attendanceModel.countDocuments({ status: 'rejected' }),
    ]);

    return { pending, validated, rejected };
  }

  async getMonthlyAttendance(year: number, month: number, employeeId?: string): Promise<Attendance[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const match: any = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (employeeId) {
      match.employee_id = employeeId;
    }

    return this.attendanceModel.find(match).sort({ date: 1, time: 1 }).exec();
  }
}
