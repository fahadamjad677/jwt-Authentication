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
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { GetUser } from './decorator';
import { CsrfGuard, jwtAcessGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

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
  getAllUsers(@Query() dto: CursorPaginationDto) {
    return this.userService.getAllUsers(dto);
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
