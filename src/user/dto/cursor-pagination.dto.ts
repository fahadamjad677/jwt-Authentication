import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string; // last user id

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 2;
}
