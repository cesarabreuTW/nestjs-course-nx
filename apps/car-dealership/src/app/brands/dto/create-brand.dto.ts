import { IsString, MinLength } from 'class-validator';

export class CreateBrandDto {
  @MinLength(1)
  @IsString()
  name: string;
}
