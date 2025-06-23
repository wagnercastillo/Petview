import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateAttendanceDto } from 'src/attendance/dto/create-attendance.dto';
import { UpdateAttendanceDto } from 'src/attendance/dto/update-attendance.dto';

function ApplyDocs(...decorators: any[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    decorators.forEach((decorator) => decorator(target, propertyKey, descriptor));
  };
}

export const Docs = {
  create: ApplyDocs(
    ApiOperation({
      summary: 'Crear nueva asistencia',
      description: 'Registra una nueva entrada o salida de asistencia para un empleado',
    }),
    ApiBody({
      type: CreateAttendanceDto,
      description: 'Datos de la asistencia a registrar',
    }),
    ApiResponse({
      status: 201,
      description: 'Asistencia creada exitosamente',
      schema: {
        example: {
          employee_id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'entry',
          date: '2024-06-22',
          time: '08:30:00',
          status: 'pending',
          _id: '60f7b3b3b3b3b3b3b3b3b3b3',
          createdAt: '2024-06-22T08:30:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
      schema: {
        example: {
          statusCode: 400,
          message: ['El tipo debe ser "entrada" o "salida"'],
          error: 'Bad Request',
        },
      },
    }),
  ),

  getWorkingHours: ApplyDocs(
    ApiOperation({
      summary: 'Obtener horario laboral',
      description: 'Retorna información sobre el horario laboral configurado y la hora actual',
    }),
    ApiResponse({
      status: 200,
      description: 'Información del horario laboral',
      schema: {
        example: {
          start: '08:00',
          end: '17:00',
          timezone: 'Sistema local',
          message: 'Horario laboral: 8:00 AM - 5:00 PM',
          currentTime: '14:30:45',
          isWithinWorkingHours: true,
        },
      },
    }),
  ),

  getEmployeeAttendances: ApplyDocs(
    ApiOperation({
      summary: 'Obtener asistencias por empleado',
      description: 'Retorna las asistencias de un empleado específico, opcionalmente filtradas por fecha',
    }),
    ApiParam({
      name: 'employeeId',
      description: 'ID del empleado',
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiQuery({
      name: 'date',
      description: 'Fecha específica (YYYY-MM-DD)',
      required: false,
      type: 'string',
      example: '2024-06-22',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencias del empleado obtenidas exitosamente',
    }),
  ),

  forceCreate: ApplyDocs(
    ApiOperation({
      summary: 'Crear asistencia forzada',
      description: 'Permite a un administrador crear una asistencia sin validación automática',
    }),
    ApiBody({
      description: 'Datos de asistencia forzada con nota administrativa',
      schema: {
        type: 'object',
        properties: {
          attendance: {
            $ref: '#/components/schemas/CreateAttendanceDto',
          },
          adminNote: {
            type: 'string',
            description: 'Nota explicativa del administrador',
            example: 'Registro manual por falla del sistema',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Asistencia forzada creada exitosamente',
    }),
  ),

  getPending: ApplyDocs(
    ApiOperation({
      summary: 'Obtener asistencias pendientes',
      description: 'Retorna todas las asistencias con estado pendiente de validación',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de asistencias pendientes',
    }),
  ),

  getStats: ApplyDocs(
    ApiOperation({
      summary: 'Obtener estadísticas de asistencias',
      description: 'Retorna estadísticas generales sobre las asistencias registradas',
    }),
    ApiResponse({
      status: 200,
      description: 'Estadísticas de asistencias',
      schema: {
        example: {
          total: 150,
          pending: 5,
          validated: 140,
          rejected: 5,
          today: 25,
        },
      },
    }),
  ),

  findAll: ApplyDocs(
    ApiOperation({
      summary: 'Obtener todas las asistencias',
      description: 'Retorna todas las asistencias con filtros opcionales',
    }),
    ApiQuery({
      name: 'employee_id',
      description: 'Filtrar por ID de empleado',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'date',
      description: 'Filtrar por fecha (YYYY-MM-DD)',
      required: false,
      type: 'string',
    }),
    ApiQuery({
      name: 'status',
      description: 'Filtrar por estado',
      required: false,
      enum: ['pending', 'validated', 'rejected'],
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de asistencias obtenida exitosamente',
      schema: {
        example: {
          Attendance: [
            {
              _id: '685875cbbf07d133104d83f1',
              employee_id: '9964cdb9-bc3e-4ac7-a669-8edea8a8ec3d',
              date: '2025-06-22',
              time: '09:00:00',
              type: 'entry',
              status: 'validated',
              validation_notes: 'Primera entrada del día',
              retry_count: 0,
              createdAt: '2025-06-22T21:29:47.153Z',
              updatedAt: '2025-06-22T21:29:47.373Z',
              __v: 0,
              employee_name: 'María Fernanda Ríos',
              validated_at: '2025-06-22T21:29:47.368Z',
            },
            {
              _id: '685876d3bcdaabd55e8c9f76',
              employee_id: '9964cdb9-bc3e-4ac7-a669-8edea8a8ec3d',
              date: '2025-06-22',
              time: '15:00:00',
              type: 'exit',
              status: 'validated',
              validation_notes: 'Salida válida después de entrada a las 09:00',
              retry_count: 0,
              createdAt: '2025-06-22T21:34:11.083Z',
              updatedAt: '2025-06-22T21:34:11.303Z',
              __v: 0,
              employee_name: 'María Fernanda Ríos',
              validated_at: '2025-06-22T21:34:11.299Z',
            },
            {
              _id: '685876ffbcdaabd55e8c9f7c',
              employee_id: 'f145726a-4306-4238-9e7b-80a12dc20403',
              date: '2025-06-22',
              time: '10:00:00',
              type: 'entry',
              status: 'validated',
              validation_notes: 'Primera entrada del día',
              retry_count: 0,
              createdAt: '2025-06-22T21:34:55.541Z',
              updatedAt: '2025-06-22T21:35:23.338Z',
              __v: 0,
              employee_name: 'Fernando Acosta',
              validated_at: '2025-06-22T21:35:23.336Z',
            },
          ],
        },
      },
    }),
  ),

  getMonthlyAttendance: ApplyDocs(
    ApiOperation({
      summary: 'Obtener asistencias mensuales',
      description: 'Retorna las asistencias de un mes específico, opcionalmente filtradas por empleado',
    }),
    ApiParam({
      name: 'year',
      description: 'Año',
      type: 'string',
      example: '2024',
    }),
    ApiParam({
      name: 'month',
      description: 'Mes (1-12)',
      type: 'string',
      example: '6',
    }),
    ApiQuery({
      name: 'employee_id',
      description: 'ID del empleado (opcional)',
      required: false,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencias mensuales obtenidas exitosamente',
    }),
  ),

  findByEmployee: ApplyDocs(
    ApiOperation({
      summary: 'Buscar asistencias por empleado',
      description: 'Retorna todas las asistencias de un empleado específico',
    }),
    ApiParam({
      name: 'employeeId',
      description: 'ID del empleado',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencias del empleado obtenidas exitosamente',
    }),
  ),

  findOne: ApplyDocs(
    ApiOperation({
      summary: 'Obtener asistencia por ID',
      description: 'Retorna una asistencia específica por su ID único',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia (MongoDB ObjectId)',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencia encontrada exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Asistencia no encontrada',
    }),
  ),

  updateAttendance: ApplyDocs(
    ApiOperation({
      summary: 'Actualizar asistencia',
      description: 'Actualiza los datos de una asistencia existente',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      type: 'string',
    }),
    ApiBody({
      type: UpdateAttendanceDto,
      description: 'Datos actualizados de la asistencia',
    }),
    ApiResponse({
      status: 200,
      description: 'Asistencia actualizada exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Asistencia no encontrada',
    }),
  ),

  updateStatus: ApplyDocs(
    ApiOperation({
      summary: 'Actualizar estado de asistencia',
      description: 'Cambia el estado de validación de una asistencia',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      type: 'string',
    }),
    ApiBody({
      description: 'Nuevo estado',
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'validated', 'rejected'],
            example: 'validated',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Estado actualizado exitosamente',
    }),
  ),

  removeAttendance: ApplyDocs(
    ApiOperation({
      summary: 'Eliminar asistencia',
      description: 'Elimina una asistencia específica del sistema',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la asistencia',
      type: 'string',
    }),
    ApiResponse({
      status: 204,
      description: 'Asistencia eliminada exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Asistencia no encontrada',
    }),
  ),

  removeByEmployee: ApplyDocs(
    ApiOperation({
      summary: 'Eliminar asistencias por empleado',
      description: 'Elimina todas las asistencias de un empleado específico',
    }),
    ApiParam({
      name: 'employeeId',
      description: 'ID del empleado',
      type: 'string',
    }),
    ApiResponse({
      status: 204,
      description: 'Asistencias del empleado eliminadas exitosamente',
    }),
  ),
};
