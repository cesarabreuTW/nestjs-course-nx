// import { PartialType } from '@nestjs/mapped-types';
// import { CreateBrandDto } from './create-brand.dto';
// export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

import { MinLength, IsString } from 'class-validator';

export class UpdateBrandDto {
  @MinLength(1)
  @IsString()
  name: string;
}
