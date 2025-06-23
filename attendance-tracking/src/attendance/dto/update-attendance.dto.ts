import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @ApiProperty({
    description: 'Razón de rechazo (si el estado es rejected)',
    example: 'Horario fuera del rango laboral permitido',
    required: false,
  })
  rejection_reason?: string;

  @ApiProperty({
    description: 'Notas de validación del administrador',
    example: 'Validado manualmente por supervisor',
    required: false,
  })
  validation_notes?: string;

  @ApiProperty({
    description: 'Nombre del empleado (se actualiza automáticamente)',
    example: 'Juan Carlos Pérez',
    required: false,
  })
  employee_name?: string;
}