import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class UpdateRole {
  @IsEnum(Role)
  role: Role;
}
