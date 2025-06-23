import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RABBITMQ_ROUTING_KEYS } from 'src/config/rabbitmq.config';
import { AttendanceValidationRequest } from './dto/validate-employee.dto';
import { EmployeeValidationHandler } from './handlers/employee-validation.handler';
import { Docs } from 'src/common/docs/employees.docs';

@ApiTags('empleados')
@Controller('empleados')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly employeeValidationHandler: EmployeeValidationHandler,
  ) {}

  @EventPattern(RABBITMQ_ROUTING_KEYS.VALIDATE_EMPLOYEE)
  async handleEmployeeValidation(
    @Payload() request: AttendanceValidationRequest,
  ) {
    await this.employeeValidationHandler.handle(request);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Docs.create
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Docs.findAll
  async findAll() {
    return await this.employeesService.findAll();
  }

  @Get('activos')
  @Docs.findActiveEmployees
  async findActiveEmployees() {
    return await this.employeesService.findAllActive();
  }

  @Get(':id')
  @Docs.findOne
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.employeesService.findOne(id);
  }

  @Put(':id')
  @Docs.update
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/desactivar')
  @HttpCode(HttpStatus.OK)
  @Docs.deactivate
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return await this.employeesService.deactivate(id);
  }

  @Patch(':id/activar')
  @HttpCode(HttpStatus.OK)
  @Docs.activate
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return await this.employeesService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Docs.remove
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.employeesService.remove(id);
  }
}
