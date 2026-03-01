import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateBookmarkDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
