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
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...restProduct } = createProductDto;
      const product = this.productRepository.create({
        ...restProduct,
        images: images.map(
          (imageUrl) => this.productImagesRepository.create({ url: imageUrl }) // TypeOrm infiere automaticamente las otras propiedades y hace la insercion en la tabla images
        ),
      });
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
      relations: {
        images: true,
      },
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // usar en vez de find, porque ya de una vez se prepara el objeto con la actualizacion
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
        images: [],
      });
      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
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
        .leftJoinAndSelect('product.images', 'images') // Es el equivalente a eager en la entidad Product
        .getOne();
    }
    return product;
  }
}
