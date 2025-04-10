import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn('increment')
  id: string;
  @Column('text')
  url: string;

  // relacion N:1
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE', // Borrar los registros asociados al producto que se borra
  })
  product: Product;
}
