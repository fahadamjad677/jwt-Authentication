import { IsIn } from 'class-validator';

export class UpdateRole {
  @IsIn(['USER', 'MODERATOR', 'ADMIN'])
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}
