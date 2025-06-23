// seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { employees } from './data/seed-data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) {}

  async runSeed() {
    try {
      this.logger.log('Iniciando seed de empleados...');
      
      await this.deleteTables();
      await this.insertEmployees();
      
      this.logger.log('Seed ejecutado exitosamente');
      return {
        message: 'SEED EJECUTADO EXITOSAMENTE',
        employeesCreated: employees.length
      };
    } catch (error) {
      this.logger.error('Error ejecutando seed:', error);
      throw new Error(`Error ejecutando seed: ${error.message}`);
    }
  }

  private async insertEmployees(): Promise<Employee[]> {
    this.logger.log(`Insertando ${employees.length} empleados...`);

    // Crear las entidades pero sin guardar aún
    const employeeEntities = employees.map(employeeData => 
      this.employeeRepository.create({
        ...employeeData,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      })
    );

    // Guardar todos los empleados
    const savedEmployees = await this.employeeRepository.save(employeeEntities);
    
    this.logger.log(`${savedEmployees.length} empleados insertados correctamente`);
    return savedEmployees;
  }

  private async deleteTables(): Promise<void> {
    this.logger.log('Limpiando tabla de empleados...');

    await this.employeeRepository
      .createQueryBuilder()
      .delete()
      .from(Employee)
      .execute();


    this.logger.log('Tabla de empleados limpiada');
  }

  // Método adicional para verificar si ya existen datos
  async checkExistingData(): Promise<{ count: number; hasData: boolean }> {
    const count = await this.employeeRepository.count();
    return {
      count,
      hasData: count > 0
    };
  }

  // Método para limpiar solo datos de seed (opcional)
  async cleanSeedData(): Promise<{ message: string; deletedCount: number }> {
    const seedEmails = employees.map(emp => emp.email);
    
    const result = await this.employeeRepository
      .createQueryBuilder()
      .delete()
      .from(Employee)
      .where('email IN (:...emails)', { emails: seedEmails })
      .execute();

    return {
      message: 'Datos de seed eliminados',
      deletedCount: result.affected || 0
    };
  }
}