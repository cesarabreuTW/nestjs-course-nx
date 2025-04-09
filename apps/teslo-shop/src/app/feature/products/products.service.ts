import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../../common/pagination-dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      skip: offset,
      take: limit,
      // TODO: relaciones
    });
    return products;
  }

  async findOne(searchText: string) {
    const product = await this.getProduct(searchText);
    return (
      product ??
      new NotFoundException(`The product with text ${searchText} was not found`)
    );
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.getProduct(id);
    if (product) {
      await this.productRepository.delete(id);
    } else {
      throw new NotFoundException(`The product with id ${id} was not found`);
    }
    return `The product with id ${id} was successfully removed`;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!');
  }

  private async getProduct(id: string): Promise<Product | null> {
    // TODO: Se utilizara el mismo metodo para buscar por id, slug o title
    // validar uuid con libreria uuid o por expresion regular
    let product: Product | null = null;
    if (isUUID(id)) {
      product = await this.productRepository.findOne({ where: { id: id } });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('product.title = :title or product.slug = :slug', {
          title: id,
          slug: id,
        })
        .getOne();
    }
    return product;
  }
}
