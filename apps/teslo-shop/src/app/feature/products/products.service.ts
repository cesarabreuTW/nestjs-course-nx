import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource // tiene la informacion de conexion a la BD
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
    const { images, ...restProduct } = updateProductDto;

    // usar en vez de find, porque ya de una vez se prepara el objeto con la actualizacion
    const product = await this.productRepository.preload({
      id,
      ...restProduct,
    });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    // TODO: crear query runner para actualizar products y productImages (transacciones)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // NOTA: en ambos casos, se borran todas las imagenes y se vuelven a crear, esto modifica el id de las imagenes
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((urlImage) =>
          this.productImagesRepository.create({ url: urlImage })
        );
      } else {
        // TODO: hay que hacer algo cuando no vengan las imagenes
        product.images = await this.productImagesRepository.findBy({
          product: { id },
        });
      }
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

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
      product = await this.productRepository.findOne({ where: { id } }); // trae los datos de productImages porque la relacion se cargó con eager en la entidad Product
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
