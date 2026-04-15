import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password!: string;

  @IsUUID('4', { message: 'Role ID must be a valid UUID v4' })
  roleId!: string;
}
