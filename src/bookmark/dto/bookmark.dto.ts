import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  title: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;
}
