import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'resource must be string' })
  @MinLength(3, { message: 'resource must be greater than 3 characters' })
  @MaxLength(50, { message: 'resource must be less than 50 characters' })
  name!: string;
}
