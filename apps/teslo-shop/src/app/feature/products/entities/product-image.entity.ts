import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text')
  url: string;

  // TODO: crear relacion con producto - N:1
}
