import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance, AttendanceDocument } from './entities/attendance.entity';
import { EmployeeValidationResponse } from 'src/rabbitmq/rabbitmq-client.service';
import { AttendanceValidationService } from './attendance-validation.service';
import { AttendanceCreationHelper } from './helpers/attendance-creation.helper';
import { RabbitMQNotificationHelper } from './helpers/rabbitmq-notification.helper';
import { ValidationResponseProcessor } from './helpers/rabbitmq/validation-response-processor.helper';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    private readonly validationService: AttendanceValidationService,
    private readonly creationHelper: AttendanceCreationHelper,
    private readonly notificationHelper: RabbitMQNotificationHelper,
    private readonly validationProcessor: ValidationResponseProcessor,
  ) {}

  
  async create(createAttendanceDto: CreateAttendanceDto): Promise<AttendanceDocument> {
    const inputValidation = this.creationHelper.validateInputData(createAttendanceDto);
    if (!inputValidation.isValid) {
      throw new BadRequestException(`Datos de entrada inválidos: ${inputValidation.errors.join(', ')}`);
    }
    // Preparar datos para creación de asistencia
    const creationData = this.creationHelper.prepareAttendanceData(createAttendanceDto);

    // Validar reglas de asistencia antes de crear
    const validationContext = this.creationHelper.createValidationContext(creationData);
    const preValidation = await this.validationService.validateAttendanceRules(validationContext, creationData.time);

    if (!preValidation.isValid) {
      throw new BadRequestException(preValidation.message);
    }

    // Construir y guardar el registro de asistencia
    const attendanceRecord = this.creationHelper.buildAttendanceObject(this.attendanceModel, creationData);
    const savedAttendance = await this.creationHelper.saveAttendanceWithLogging(attendanceRecord);

    // Enviar solicitud de validación a cola RabbitMQ (Asíncrono)
    const notificationResult = await this.notificationHelper.sendValidationRequest(savedAttendance);

    // Log del resultado de la notificación (sin afectar la respuesta)
    if (!notificationResult.success) {
      this.notificationHelper.handleNotificationError(savedAttendance, notificationResult.error);
    }

    return savedAttendance;
  }


  async processValidationResponse(response: EmployeeValidationResponse): Promise<void> {
    const result = await this.validationProcessor.processValidationResponse(response);

    // Log del resultado general
    result.success
      ? this.logger.log(`Procesamiento exitoso: ${result.message}`)
      : this.logger.error(`Error en procesamiento: ${result.message}`);
  }

  async createWithoutValidation(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const createdAttendance = new this.attendanceModel({
      ...createAttendanceDto,
      status: 'pending', 
    });
    return createdAttendance.save();
  }

  async forceCreateAttendance(createAttendanceDto: CreateAttendanceDto, adminNote: string): Promise<Attendance> {
    this.logger.warn(`⚠️ Creación forzada de asistencia por administrador: ${adminNote}`);

    // Preparar datos para creación forzada
    const forceCreationData = this.creationHelper.prepareForceCreationData(createAttendanceDto, adminNote);

    // Contruir y guardar el registro de asistencia
    const attendanceRecord = this.creationHelper.buildAttendanceObject(this.attendanceModel, forceCreationData);
    const savedAttendance = await this.creationHelper.saveAttendanceWithLogging(attendanceRecord);

    // Log de la creación forzada
    const operationSummary = this.creationHelper.createOperationSummary(savedAttendance);
    this.logger.log(`🛠️ ${operationSummary}`);

    return savedAttendance;
  }


  async updateAttendance(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const validation = await this.validationService.validateExistingAttendance(id, updateAttendanceDto);
    if (!validation.isValid) throw new BadRequestException(validation.message);

    const updatedAttendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
      .exec();

    if (!updatedAttendance) throw new NotFoundException(`Attendance record with ID ${id} not found`);

    return updatedAttendance;
  }

  async updateStatus(id: string, status: 'pending' | 'validated' | 'rejected'): Promise<Attendance> {
    return this.updateAttendance(id, { status });
  }

  async removeAttendance(id: string): Promise<void> {
    const result = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
  }

  async removeByEmployee(employeeId: string): Promise<void> {
    await this.attendanceModel.deleteMany({ employee_id: employeeId }).exec();
  }
}