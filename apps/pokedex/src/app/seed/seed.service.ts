import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom, map } from 'rxjs';
import { Pokemon } from '../pokemon/entities/pokemon.entity';

@Injectable()
export class SeedService {
  private url = 'https://pokeapi.co/api/v2/pokemon?limit=200';
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async executeSeed() {
    await this.pokemonModel.deleteMany();
    const response = await lastValueFrom(
      this.httpService.get(this.url).pipe(map((response) => response.data)),
    );
    await this.pokemonModel.insertMany(this.parsePokemons(response.results));
    return 'Done!';
  }
  private parsePokemons(
    data: Record<'name' | 'url', string>[],
  ): Record<'name' | 'no', any>[] {
    return data.map(({ name, url }) => ({
      name,
      no: +url.split('/')[url.split('/').length - 2],
    }));
  }
}

/*

Para poder hacer CRUD en la BD, necesitamos inyectar el modelo del esquema en el servicio.
  El modelo se encuentra en el módulo Pokemon, por lo que se debe exportar el Módulo Mongoose que existe en ese módulo. luego en el servicio colocar:
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,

*/
