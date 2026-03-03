import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { jwtAcessGuard } from 'src/auth/guard/jwtAccessGuard';
import { GetUser } from './decorator/getUser.decorator';
import type { PayloadUser } from '../auth/types';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RolesGuard } from '../auth/guard/rolesGuard';
import { Roles } from 'src/auth/decorator';
import { UpdateRole } from './dto';
import type { RequestWithUser } from 'src/auth/interface';
import { Role } from 'src/generated/prisma/enums';

@UseGuards(jwtAcessGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Get currently logged-in user
  @Get('me')
  getMe(@GetUser() user: PayloadUser) {
    return this.userService.getById(user.sub);
  }

  //Update current user profile
  @Patch('me')
  updateMe(@GetUser() user: PayloadUser, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user.sub, dto);
  }

  // Delete current account
  @Delete('me')
  deleteMe(@GetUser() user: PayloadUser) {
    return this.userService.deleteUser(user.sub);
  }

  //Get all users (admin use-case)
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Get user by ID
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get(':id')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getById(id);
  }
  //Update Role.
  @Patch(':id/role')
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateUserRole(
    @Param() id: string,
    @Body() dto: UpdateRole,
    @Req() request: RequestWithUser,
  ) {
    return this.userService.UpdateRole(id, dto.role, request.user);
  }
}
