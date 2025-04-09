import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../feature/products/entities/product.entity';
import { initialData } from './seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  async create() {
    try {
      const insertions = initialData.products.map((product) => {
        const producCreated = this.productRepository.create(product);
        return this.productRepository.save(producCreated);
      });
      await Promise.all(insertions);
      return 'Seed executed!!';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('No se pudo!');
    }
  }
}
