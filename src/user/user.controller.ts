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

@UseGuards(jwtAcessGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Get currently logged-in user
  @Get('me')
  getMe(@GetUser() user: PayloadUser) {
    return this.userService.getById(user.sub);
  }

  // Get user by ID
  @Get(':id')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getById(id);
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
}
