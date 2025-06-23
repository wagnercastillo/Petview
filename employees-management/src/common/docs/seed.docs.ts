import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  executeSeed: ApplyDocs(
    ApiOperation({
      summary: 'Ejecutar seed de empleados',
      description:
        'Ejecuta el seed para insertar empleados de prueba en la base de datos. Limpia la tabla existente e inserta nuevos datos.',
    }),
    ApiResponse({
      status: 200,
      description: 'Seed ejecutado exitosamente',
      schema: {
        example: {
          message: 'SEED EJECUTADO EXITOSAMENTE',
          employeesCreated: 20,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error ejecutando el seed',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error ejecutando seed: Database connection failed',
          error: 'Internal Server Error',
        },
      },
    }),
  ),

  checkSeedStatus: ApplyDocs(
    ApiOperation({
      summary: 'Verificar estado del seed',
      description:
        'Verifica si existen datos en la tabla de empleados y retorna la cantidad actual.',
    }),
    ApiResponse({
      status: 200,
      description: 'Estado del seed obtenido exitosamente',
      schema: {
        example: {
          count: 3,
          hasData: true,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error verificando el estado',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error checking database status',
          error: 'Internal Server Error',
        },
      },
    }),
  ),

  cleanSeedData: ApplyDocs(
    ApiOperation({
      summary: 'Limpiar datos de seed',
      description:
        'Elimina únicamente los empleados que fueron creados por el seed, basándose en sus emails.',
    }),
    ApiResponse({
      status: 200,
      description: 'Datos de seed eliminados exitosamente',
      schema: {
        example: {
          message: 'Datos de seed eliminados',
          deletedCount: 3,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error eliminando datos de seed',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error cleaning seed data',
          error: 'Internal Server Error',
        },
      },
    }),
  ),
};
