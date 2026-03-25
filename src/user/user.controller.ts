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

import { jwtAcessGuard } from 'src/auth/guard/jwtAccessGuard';
import { GetUser } from './decorator/getUser.decorator';
import type { PayloadUser } from '../auth/types';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RolesGuard } from '../auth/guard/rolesGuard';
import { Roles } from 'src/auth/decorator';
import { UpdateRole } from './dto';
import { PermissionsGuard } from '../auth/guard/permissionGuard';
import { Permissions } from '../auth/decorator/index';

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
  @Permissions('update_profile')
  updateMe(@GetUser() user: PayloadUser, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.sub, dto);
  }

  // Delete own account
  @Delete('me')
  @Permissions('delete_account')
  deleteMe(@GetUser() user: PayloadUser) {
    return this.userService.deleteUser(user.sub);
  }

  // Admin: Get all users
  @Get()
  @Roles('admin')
  @Permissions('view_users')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  //  Admin/Moderator: Get user by ID
  @Get(':id')
  @Roles('admin', 'moderator', 'ADMIN')
  @Permissions('view_user')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getById(id);
  }

  //  Update user role (high privilege)
  @Patch(':id/role')
  @Roles('admin')
  @Permissions('update_user_role')
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRole,
    @GetUser() user: PayloadUser,
  ) {
    return this.userService.updateRole(id, dto.role, user);
  }
}
