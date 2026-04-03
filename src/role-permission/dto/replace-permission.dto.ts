import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class ReplacePermissionsDto {
  @IsUUID()
  roleId: string;

  @IsArray()
  @ArrayNotEmpty()
  permissionIds: string[];
}
