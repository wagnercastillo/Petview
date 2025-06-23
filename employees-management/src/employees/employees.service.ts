import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import {
  EmployeeValidationResponse,
  ValidateEmployeeDto,
} from './dto/validate-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    await this.validateUniqueFields(
      createEmployeeDto.email,
      createEmployeeDto.cedula,
    );

    try {
      const employee = this.employeeRepository.create(createEmployeeDto);
      return await this.employeeRepository.save(employee);
    } catch (error) {
      throw new ConflictException('Error al crear el empleado');
    }
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      order: { fechaCreacion: 'DESC' },
    });
  }

  async validateEmployee(
    validateEmployeeDto: ValidateEmployeeDto,
  ): Promise<EmployeeValidationResponse> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: {
          id: validateEmployeeDto.employeeId,
          activo: true,
        },
      });

      if (!employee) {
        return {
          isValid: false,
          employeeId: validateEmployeeDto.employeeId,
          message: 'Empleado no encontrado o inactivo',
          attendanceId: '',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        isValid: true,
        employeeId: validateEmployeeDto.employeeId,
        message: 'Empleado válido',
        employee: {
          id: employee.id,
          nombre: employee.nombre,
          email: employee.email,
        },
        attendanceId: '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isValid: false,
        employeeId: validateEmployeeDto.employeeId,
        message: 'Error interno del servidor',
        attendanceId: '',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async findAllActive(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { activo: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({ id });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    await this.validateUniqueFieldsForUpdate(
      employee,
      updateEmployeeDto.email,
      updateEmployeeDto.cedula,
    );

    try {
      await this.employeeRepository.update(id, updateEmployeeDto);
      return await this.findOne(id);
    } catch (error) {
      throw new ConflictException('Error al actualizar el empleado');
    }
  }

  async deactivate(id: string) {
    const employee = await this.findOne(id);

    if (!employee.activo) {
      throw new BadRequestException('El empleado ya está desactivado');
    }

    return await this.updateEmployeeStatus(employee, false);
  }

  async activate(id: string) {
    const employee = await this.findOne(id);

    if (employee.activo) {
      throw new BadRequestException('El empleado ya está activo');
    }

    return await this.updateEmployeeStatus(employee, true);
  }

  async remove(id: string): Promise<{ message: string }> {
    const employee = await this.findOne(id);

    try {
      await this.employeeRepository.remove(employee);
      return { message: 'Empleado eliminado permanentemente' };
    } catch (error) {
      throw new ConflictException('Error al eliminar el empleado');
    }
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { email },
    });
  }

  async findByCedula(cedula: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { cedula },
    });
  }

  private async validateUniqueFields(
    email: string,
    cedula: string,
  ): Promise<void> {
    const [existingByEmail, existingByCedula] = await Promise.all([
      this.findByEmail(email),
      this.findByCedula(cedula),
    ]);

    if (existingByEmail) {
      throw new ConflictException('Ya existe un empleado con este email');
    }

    if (existingByCedula) {
      throw new ConflictException('Ya existe un empleado con esta cédula');
    }
  }

  private async validateUniqueFieldsForUpdate(
    currentEmployee: Employee,
    newEmail?: string,
    newCedula?: string,
  ): Promise<void> {

    if (newEmail && newEmail !== currentEmployee.email) {
      const existingByEmail = await this.findByEmail(newEmail);
      if (existingByEmail) {
        throw new ConflictException('Ya existe un empleado con este email');
      }
    }

    if (newCedula && newCedula !== currentEmployee.cedula) {
      const existingByCedula = await this.findByCedula(newCedula);
      if (existingByCedula) {
        throw new ConflictException('Ya existe un empleado con esta cédula');
      }
    }
  }

  private async updateEmployeeStatus(employee: Employee, isActive: boolean) {
    employee.activo = isActive;
    employee.fechaDesactivacion = isActive ? undefined : new Date();

    const updatedEmployee = await this.employeeRepository.save(employee);

    return {
      message: `Empleado ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      employee: updatedEmployee,
    };
  }
}
