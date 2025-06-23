import { IsString, IsNotEmpty, IsIn, IsOptional, IsDateString, Matches, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'ID único del empleado (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({
    description: 'Tipo de registro de asistencia',
    enum: ['entry', 'exit'],
    example: 'entry',
  })
  @IsString()
  @IsIn(['entry', 'exit'], {
    message: 'El tipo debe ser "entry" o "exit"',
  })
  type: 'entry' | 'exit';

  @ApiProperty({
    description: 'Estado de validación de la asistencia',
    enum: ['pending', 'validated', 'rejected'],
    default: 'pending',
    required: false,
  })
  @IsEnum(['pending', 'validated', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'validated' | 'rejected';

  @ApiProperty({
    description: 'Fecha del registro (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual',
    example: '2024-06-22',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha debe tener formato YYYY-MM-DD',
    },
  )
  date?: string;

  @ApiProperty({
    description: 'Hora del registro (HH:mm:ss). Si no se proporciona, se usa la hora actual',
    example: '08:30:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$',
    required: false,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'La hora debe tener formato HH:mm:ss',
  })
  time?: string;

  @ApiProperty({
    description: 'Observaciones o notas adicionales sobre el registro',
    example: 'Entrada tardía por cita médica',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}