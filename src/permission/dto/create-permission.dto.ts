import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString({ message: 'resource must be a string' })
  @IsNotEmpty({ message: 'Resource must not be empty' })
  @MaxLength(50, { message: 'resource must not exceed 50 characters' })
  resource!: string;

  @IsString({ message: 'action must be a string' })
  @IsNotEmpty({ message: 'action must not be empty' })
  @MaxLength(50, { message: 'action must not exceed 50 characters' })
  action!: string;
}
