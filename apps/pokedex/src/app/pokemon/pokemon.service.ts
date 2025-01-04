import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatorDto } from '../common/dto/paginator-dto/paginator-dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exists in db ${JSON.stringify(error.errmsg)}`,
        );
      }
      throw new InternalServerErrorException(
        `Can't create pokemon - Check server logs`,
      );
    }
  }

  findAll(paginatorDto: PaginatorDto) {
    const {
      limit = this.configService.get<number>('defaultLimit'),
      offset = 0,
    } = paginatorDto;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });
  }

  async findOne(id: string) {
    let pokemon: Pokemon;
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }
    if (!pokemon) {
      // Intenta buscarlo por el nombre en caso de no encontrarlo, devuelve null
      pokemon = await this.pokemonModel.findOne({
        name: id.toLocaleLowerCase().trim(),
      });
    }
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Please, use a valid id`);
      }
      const updatedPokemon = await this.pokemonModel.findByIdAndUpdate(
        id,
        updatePokemonDto,
      );
      if (!updatedPokemon) {
        throw new BadRequestException(`Can't update pokemon with id ${id}`);
      }
      return { ...updatedPokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exists with no ${updatePokemonDto.no}`,
        );
      }
      throw new InternalServerErrorException(
        `Can't update pokemon - Check server logs`,
      );
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`value with id "${id}" not found`);
    }
    return;
  }
}

/*

Para poder hacer CRUD en la BD, necesitamos inyectar el modelo del esquema en el servicio.
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,

*/
