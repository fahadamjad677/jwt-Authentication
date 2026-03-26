import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { jwtAcessGuard, RolesGuard, PermissionsGuard } from '../auth/guard';
import { GetUser } from './decorator/getUser.decorator';
import type { PayloadUser } from '../auth/types';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles, Permissions } from '../auth/decorator';
import { UpdateRole } from './dto';

@UseGuards(jwtAcessGuard, RolesGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Current user
  @Get('me')
  getMe(@GetUser() user: PayloadUser) {
    return this.userService.getById(user.sub);
  }

  // Update own profile
  @Patch('me')
  @Permissions('update_own_profile')
  updateMe(@GetUser() user: PayloadUser, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.sub, dto);
  }

  // Delete own account
  @Delete('me')
  @Permissions('delete_account')
  deleteMe(@GetUser() user: PayloadUser) {
    return this.userService.deleteUser(user.sub);
  }

  // Admin/Moderator: Get all users
  @Get()
  @Roles('ADMIN', 'MODERATOR')
  @Permissions('view_users')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  //  Admin/Moderator: Get user by ID
  @Get(':id')
  @Roles('ADMIN', 'MODERATOR')
  @Permissions('view_user')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getById(id);
  }

  //  Update user role (high privilege)
  @Patch(':id/role')
  @Roles('ADMIN')
  @Permissions('update_user_role')
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRole,
    @GetUser() user: PayloadUser,
  ) {
    return this.userService.updateRole(id, dto.role, user);
  }
}
