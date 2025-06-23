import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EmployeesService } from '../employees.service';
import { RABBITMQ_ROUTING_KEYS } from 'src/config/rabbitmq.config';
import {
  AttendanceValidationRequest,
  EmployeeValidationResponse,
} from '../dto/validate-employee.dto';

@Injectable()
export class EmployeeValidationHandler {
  constructor(
    private readonly employeesService: EmployeesService,
    @Inject('RABBITMQ_RESPONSE_CLIENT')
    private readonly responseClient: ClientProxy,
  ) {}

  async handle(request: AttendanceValidationRequest) {
    try {
      const employee = await this.employeesService.findOne(request.employeeId);

      const response: EmployeeValidationResponse =
        employee && employee.activo
          ? {
              attendanceId: request.attendanceId,
              isValid: true,
              employeeId: request.employeeId,
              employeeName: employee.nombre,
              timestamp: new Date().toISOString(),
            }
          : {
              attendanceId: request.attendanceId,
              isValid: false,
              employeeId: request.employeeId,
              message: 'Empleado no encontrado o inactivo',
              timestamp: new Date().toISOString(),
            };

      const routingKey = response.isValid
        ? RABBITMQ_ROUTING_KEYS.EMPLOYEE_VALIDATED
        : RABBITMQ_ROUTING_KEYS.EMPLOYEE_REJECTED;

      console.log(
        response.isValid
          ? '✅ Enviando respuesta POSITIVA:'
          : '❌ Enviando respuesta NEGATIVA:',
        response,
      );

      this.responseClient.emit(routingKey, response);
    } catch (error) {
      console.error('❌ Error validando empleado:', error);

      const response: EmployeeValidationResponse = {
        attendanceId: request.attendanceId,
        isValid: false,
        employeeId: request.employeeId,
        message: 'Error interno del sistema',
        timestamp: new Date().toISOString(),
      };

      this.responseClient.emit(
        RABBITMQ_ROUTING_KEYS.EMPLOYEE_REJECTED,
        response,
      );
    }
  }
}
