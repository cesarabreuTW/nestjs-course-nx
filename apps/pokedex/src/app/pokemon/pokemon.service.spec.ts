import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { ConfigModule } from '@nestjs/config';

describe('PokemonService', () => {
  let service: PokemonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonService],
      imports: [ConfigModule],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
