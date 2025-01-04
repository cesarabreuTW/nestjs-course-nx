import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pokemon extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  name: string;
  @Prop({
    unique: true,
    index: true,
  })
  no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

/*
Se agrega el decorador Schema para indicarle a Nest que esto es un esquema de base de datos
Se extiende de Document, que pertenece a mongoose.
esta clase Pokemon representaria una colección y sus propiedades, los campos de cada documento.

las propiedades tienen el decorador Prop para indicar reglas de negocio

- id => no se especifica porque mongo lo genera automaticamente (UUID)
- name => es el nombre del pokemon
- no => es el numero del pokemon

*/
