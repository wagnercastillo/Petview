import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empleados')
export class Employee {
  @ApiProperty({
    description: 'ID único del empleado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Carlos Pérez',
  })
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del empleado',
    example: 'juan.perez@empresa.com',
  })
  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @ApiProperty({
    description: 'Número de cédula del empleado',
    example: '1234567890',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @ApiProperty({
    description: 'Estado activo del empleado',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ApiProperty({
    description: 'Número de teléfono del empleado',
    example: '+593987654321',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @ApiProperty({
    description: 'Cargo del empleado',
    example: 'Desarrollador Senior',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  cargo?: string;

  @ApiProperty({
    description: 'Salario del empleado',
    example: 2500.00,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salario?: number;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado',
    example: '2024-01-15T00:00:00Z',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  fechaIngreso?: Date;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-06-22T10:30:00Z',
  })
  @CreateDateColumn()
  fechaCreacion: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-06-22T15:45:00Z',
  })
  @UpdateDateColumn()
  fechaActualizacion: Date;

  @ApiProperty({
    description: 'Fecha de desactivación del empleado',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @Column({ nullable: true })
  fechaDesactivacion?: Date;
}