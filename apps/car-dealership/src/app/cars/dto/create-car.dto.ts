import { IsString } from 'class-validator';

export class CreateCarDto {
  @IsString()
  readonly model: string;

  @IsString()
  readonly brand: string;
}
