import { IsOptional, IsEmail, MinLength, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;
}
