import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';

import { RABBITMQ_ROUTING_KEYS } from 'src/config/rabbitmq.config';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

import { EmployeeValidationResponse } from 'src/rabbitmq/rabbitmq-client.service';
import { AttendanceQueryService } from './attendance-query.service';
import { AttendanceService } from './attendance.service';

import { Docs } from '../common/docs/attendance.doc';

@ApiTags('attendance')
@Controller('attendance')
@UsePipes(new ValidationPipe({ transform: true }))
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceQueryService: AttendanceQueryService,
  ) {}

  @Post()
  @Docs.create
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @EventPattern(RABBITMQ_ROUTING_KEYS.EMPLOYEE_VALIDATED)
  async handleEmployeeValidated(@Payload() response: EmployeeValidationResponse) {
    console.log('📥 ✅ Recibida validación POSITIVA:', response);
    await this.attendanceService.processValidationResponse({
      ...response,
      isValid: true,
    });
  }

  @EventPattern(RABBITMQ_ROUTING_KEYS.EMPLOYEE_REJECTED)
  async handleEmployeeRejected(@Payload() response: EmployeeValidationResponse) {
    console.log('📥 ❌ Recibida validación NEGATIVA:', response);
    await this.attendanceService.processValidationResponse({
      ...response,
      isValid: false,
    });
  }

  @Get('working-hours')
  @Docs.getWorkingHours
  async getWorkingHours() {
    return {
      start: '08:00',
      end: '17:00',
      timezone: 'Sistema local',
      message: 'Horario laboral: 8:00 AM - 5:00 PM',
      currentTime: new Date().toTimeString().split(' ')[0],
      isWithinWorkingHours: this.isCurrentTimeWithinWorkingHours(),
    };
  }

  private isCurrentTimeWithinWorkingHours(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 8 && currentHour < 17;
  }

  @Get('employee/:employeeId')
  @Docs.getEmployeeAttendances
  async getEmployeeAttendances(@Param('employeeId') employeeId: string, @Query('date') date?: string) {
    if (date) {
      return this.attendanceQueryService.getAttendancesByEmployeeAndDate(employeeId, date);
    }
    return { message: 'Especifique una fecha' };
  }

  @Post('force')
  @Docs.forceCreate
  async forceCreate(@Body() body: { attendance: CreateAttendanceDto; adminNote: string }) {
    return this.attendanceService.forceCreateAttendance(body.attendance, body.adminNote);
  }

  @Get('pending')
  @Docs.getPending
  async getPending() {
    return this.attendanceQueryService.getPendingAttendances();
  }

  @Get('stats')
  @Docs.getStats
  async getStats() {
    return this.attendanceQueryService.getAttendanceStats();
  }

  @Get()
  @Docs.findAll
  async findAll(
    @Query('employee_id') employeeId?: string,
    @Query('date') date?: string,
    @Query('status') status?: 'pending' | 'validated' | 'rejected',
  ) {
    if (employeeId && date) return this.attendanceQueryService.findByEmployeeAndDate(employeeId, date);
    if (employeeId) return this.attendanceQueryService.findByEmployee(employeeId);
    if (date) return this.attendanceQueryService.findByDate(date);
    if (status) return this.attendanceQueryService.findByStatus(status);

    return this.attendanceQueryService.findAll();
  }

  @Get('monthly/:year/:month')
  @Docs.getMonthlyAttendance
  async getMonthlyAttendance(
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.attendanceQueryService.getMonthlyAttendance(parseInt(year), parseInt(month), employeeId);
  }

  @Get('employee/:employeeId')
  @Docs.findByEmployee
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceQueryService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Docs.findOne
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.attendanceQueryService.findOne(id);
  }

  @Patch(':id')
  @Docs.updateAttendance
  async updateAttendance(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, updateAttendanceDto);
  }

  @Patch(':id/status')
  @Docs.updateStatus
  async updateStatus(@Param('id') id: string, @Body('status') status: 'pending' | 'validated' | 'rejected') {
    return this.attendanceService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Docs.removeAttendance
  async removeAttendance(@Param('id') id: string) {
    return this.attendanceService.removeAttendance(id);
  }

  @Delete('employee/:employeeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Docs.removeByEmployee
  async removeByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceService.removeByEmployee(employeeId);
  }
}