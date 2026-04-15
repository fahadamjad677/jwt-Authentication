import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { GetUser } from './decorator';
import { CsrfGuard, jwtAcessGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';

@UseGuards(jwtAcessGuard, CsrfGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('super-admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create User (Admin/User)
  @Post()
  createUser(
    @Body() dto: CreateUserDto,
    @GetUser('sub', ParseUUIDPipe) id: string,
  ) {
    return this.userService.createUser(dto, id);
  }

  // Get All Users
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Get Single User
  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }

  // Update User
  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  // Soft Delete
  @Delete(':id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.softDeleteUser(id);
  }
}
