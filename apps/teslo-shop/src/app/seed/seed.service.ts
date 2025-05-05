import { Injectable } from '@nestjs/common';
import { ProductsService } from '../feature/products/products.service';
import { initialData } from './seed';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}
  async runSeed() {
    await this.insertNewProducts();
    return 'SEED EXECUTED';
  }

  private async insertNewProducts() {
    const products = initialData.products;
    const asyncInsertionList = products.map((product) =>
      this.productsService.create(product)
    );
    await this.productsService.deleteAllProducts();
    await Promise.all(asyncInsertionList);

    return true;
  }
}
