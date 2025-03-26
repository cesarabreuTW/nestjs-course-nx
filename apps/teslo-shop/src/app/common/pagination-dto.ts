import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Es lo mismo que  enableImplicitConversions: true
  limit?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number) // Es lo mismo que  enableImplicitConversions: true
  offset?: number;
}
