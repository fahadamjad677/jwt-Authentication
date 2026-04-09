import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString({ message: 'resource must be a string' })
  @MaxLength(50, { message: 'resource must not exceed 50 characters' })
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString({ message: 'resource must be a string' })
  @MaxLength(50, { message: 'resource must not exceed 50 characters' })
  action?: string;
}
