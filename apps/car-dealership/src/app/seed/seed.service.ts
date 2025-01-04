import { Injectable } from '@nestjs/common';
import { BrandsService } from '../brands/brands.service';
import { CarsService } from '../cars/cars.service';
import { BRANDS_SEED } from './data/brands.seed';
import { CARS_SEED } from './data/cars.seed';

@Injectable()
export class SeedService {
  constructor(
    private carsService: CarsService,
    private brandsService: BrandsService
  ) {}
  populateDB() {
    this.carsService.fillCarsWithSeed(CARS_SEED);
    this.brandsService.fillBrandsWithSeed(BRANDS_SEED);
    return 'Seed executed';
  }
}
