import { IsIn } from 'class-validator';

export class UpdateRole {
  @IsIn(['user', 'moderator', 'admin'])
  role: 'user' | 'moderator' | 'admin';
}
