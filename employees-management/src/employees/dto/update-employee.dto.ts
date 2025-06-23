import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({
    description: 'Nombre completo del empleado',
    example: 'Juan Carlos Pérez Actualizado',
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del empleado',
    example: 'juan.perez.nuevo@empresa.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Número de cédula del empleado',
    example: '1234567891',
  })
  cedula?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del empleado',
    example: '+593987654322',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición del empleado',
    example: 'Lead Developer',
  })
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Salario del empleado',
    example: 3000.00,
  })
  salario?: number;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del empleado',
    example: '2024-02-01',
  })
  fechaIngreso?: Date;
}