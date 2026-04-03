import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { GetUser } from './decorator';
import type { PayloadUser } from '../auth/types';
import { CsrfGuard, jwtAcessGuard } from '../auth/guard';

@UseGuards(jwtAcessGuard, CsrfGuard)
@Controller('super-admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create User (Admin/User)
  @Post()
  createUser(@Body() dto: CreateUserDto, @GetUser() user: PayloadUser) {
    return this.userService.createUser(dto, user.sub);
  }

  // Get All Users
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Get Single User
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  // Update User
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  // Soft Delete
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.softDeleteUser(id);
  }
}
