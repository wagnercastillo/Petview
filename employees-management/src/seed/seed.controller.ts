import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Docs } from 'src/common/docs/seed.docs';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('ejecutar')
  @HttpCode(HttpStatus.OK)
  @Docs.executeSeed
  async executeSeed() {
    return await this.seedService.runSeed();
  }

  @Get('estado')
  @Docs.checkSeedStatus
  async checkSeedStatus() {
    return await this.seedService.checkExistingData();
  }

  @Post('limpiar')
  @HttpCode(HttpStatus.OK)
  @Docs.cleanSeedData
  async cleanSeedData() {
    return await this.seedService.cleanSeedData();
  }
}
