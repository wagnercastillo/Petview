import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Carlos Pérez',
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del empleado (debe ser único)',
    example: 'juan.perez@empresa.com',
    maxLength: 150,
  })
  @IsEmail()
  @Length(1, 150)
  email: string;

  @ApiProperty({
    description: 'Número de cédula del empleado (debe ser único)',
    example: '1234567890',
    maxLength: 20,
  })
  @IsString()
  @Length(1, 20)
  cedula: string;

  @ApiProperty({
    description: 'Número de teléfono del empleado',
    example: '+593987654321',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;

  @ApiProperty({
    description: 'Cargo o posición del empleado',
    example: 'Desarrollador Senior',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  cargo?: string;

  @ApiProperty({
    description: 'Salario del empleado',
    example: 2500.0,
    minimum: 0,
    type: 'number',
    format: 'decimal',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  salario?: number;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: Date;
}
