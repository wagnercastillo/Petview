import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateEmployeeDto {
  @ApiProperty({ description: 'UUID del empleado que se quiere validar' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;
}

export class EmployeeValidationResponse {
  @ApiProperty()
  attendanceId: string;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  employeeId: string;

  @ApiProperty({ required: false })
  employeeName?: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({
    required: false,
    type: () => ({
      id: { type: 'string' },
      nombre: { type: 'string' },
      email: { type: 'string' },
    }),
  })
  employee?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export class AttendanceValidationRequest {
  @ApiProperty()
  attendanceId: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty({ enum: ['entry', 'exit'] })
  type: 'entry' | 'exit';

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  retryCount?: number;
}
