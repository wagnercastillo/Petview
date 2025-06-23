// seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    EmployeesModule
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}