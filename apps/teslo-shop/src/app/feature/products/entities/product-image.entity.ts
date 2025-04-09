import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn('increment')
  id: string;
  @Column('text')
  url: string;

  // relacion N:1
  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
