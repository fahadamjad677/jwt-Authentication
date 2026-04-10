import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray({ message: 'resource must be an array' })
  @ArrayNotEmpty({ message: 'resource must not be empty' })
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
