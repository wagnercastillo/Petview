import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateEmployeeDto } from 'src/employees/dto/create-employee.dto';
import { UpdateEmployeeDto } from 'src/employees/dto/update-employee.dto';
import { Employee } from 'src/employees/entities/employee.entity';

function ApplyDocs(...decorators: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    decorators.forEach((decorator) =>
      decorator(target, propertyKey, descriptor),
    );
  };
}

export const Docs = {
  create: ApplyDocs(
    ApiOperation({
      summary: 'Crear nuevo empleado',
      description: 'Crea un nuevo empleado en el sistema',
    }),
    ApiBody({
      type: CreateEmployeeDto,
      description: 'Datos del empleado a crear',
    }),
    ApiResponse({
      status: 201,
      description: 'Empleado creado exitosamente',
      type: Employee,
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o empleado ya existe',
      schema: {
        example: {
          statusCode: 400,
          message: ['email must be unique', 'cedula must be unique'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  ),

  findAll: ApplyDocs(
    ApiOperation({
      summary: 'Obtener todos los empleados',
      description:
        'Retorna una lista de todos los empleados (activos e inactivos)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de empleados obtenida exitosamente',
      type: [Employee],
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  ),

  findActiveEmployees: ApplyDocs(
    ApiOperation({
      summary: 'Obtener empleados activos',
      description: 'Retorna una lista de todos los empleados activos',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de empleados activos obtenida exitosamente',
      type: [Employee],
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  ),

  findOne: ApplyDocs(
    ApiOperation({
      summary: 'Obtener empleado por ID',
      description: 'Retorna un empleado específico por su ID único',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID único del empleado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Empleado encontrado exitosamente',
      type: Employee,
    }),
    ApiResponse({
      status: 404,
      description: 'Empleado no encontrado',
      schema: {
        example: {
          statusCode: 404,
          message: 'Empleado no encontrado',
          error: 'Not Found',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID inválido (debe ser UUID)',
    }),
  ),

  update: ApplyDocs(
    ApiOperation({
      summary: 'Actualizar empleado',
      description: 'Actualiza completamente los datos de un empleado existente',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID único del empleado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiBody({
      type: UpdateEmployeeDto,
      description: 'Datos actualizados del empleado',
    }),
    ApiResponse({
      status: 200,
      description: 'Empleado actualizado exitosamente',
      type: Employee,
    }),
    ApiResponse({
      status: 404,
      description: 'Empleado no encontrado',
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o conflicto de unicidad',
    }),
  ),

  deactivate: ApplyDocs(
    ApiOperation({
      summary: 'Desactivar empleado',
      description: 'Marca un empleado como inactivo sin eliminarlo del sistema',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID único del empleado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Empleado desactivado exitosamente',
      type: Employee,
    }),
    ApiResponse({
      status: 404,
      description: 'Empleado no encontrado',
    }),
    ApiResponse({
      status: 400,
      description: 'El empleado ya está desactivado',
    }),
  ),

  activate: ApplyDocs(
    ApiOperation({
      summary: 'Activar empleado',
      description: 'Reactiva un empleado previamente desactivado',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID único del empleado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Empleado activado exitosamente',
      type: Employee,
    }),
    ApiResponse({
      status: 404,
      description: 'Empleado no encontrado',
    }),
    ApiResponse({
      status: 400,
      description: 'El empleado ya está activo',
    }),
  ),

  remove: ApplyDocs(
    ApiOperation({
      summary: 'Eliminar empleado',
      description: 'Elimina permanentemente un empleado del sistema',
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'ID único del empleado (UUID)',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 204,
      description: 'Empleado eliminado exitosamente',
    }),
    ApiResponse({
      status: 404,
      description: 'Empleado no encontrado',
    }),
    ApiResponse({
      status: 400,
      description: 'No se puede eliminar el empleado (posibles dependencias)',
    }),
  ),
};
