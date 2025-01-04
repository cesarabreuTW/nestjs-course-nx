import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly brandsService: SeedService) {}

  @Get()
  runSeed() {
    return this.brandsService.populateDB();
  }
}
