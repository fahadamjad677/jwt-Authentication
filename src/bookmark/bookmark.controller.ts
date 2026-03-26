import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { jwtAcessGuard, PermissionsGuard, RolesGuard } from '../auth/guard';
import { GetUser } from '../user/decorator/getUser.decorator';
import type { PayloadUser } from '../auth/types';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto';
import { UpdateBookmarkDto } from './dto';
import { Permissions, Roles } from '../auth/decorator';

@UseGuards(jwtAcessGuard, RolesGuard, PermissionsGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  // Create bookmark
  @Post()
  @Permissions('create_bookmark')
  create(@GetUser() user: PayloadUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.create(user.sub, dto);
  }

  //Get all bookmarks for current user
  @Get('me')
  @Permissions('view_own_bookmarks')
  findAll(@GetUser() user: PayloadUser) {
    return this.bookmarkService.findAll(user.sub);
  }

  // Get single bookmark by id
  @Get(':id')
  @Permissions('view_own_bookmarks')
  findOne(
    @GetUser() user: PayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookmarkService.findOne(user.sub, id);
  }

  //Update bookmark
  @Permissions('update_bookmark')
  @Patch(':id')
  update(
    @GetUser() user: PayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.update(user.sub, id, dto);
  }

  //Delete bookmark
  @Permissions('delete_bookmark')
  @Delete(':id')
  remove(@GetUser() user: PayloadUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookmarkService.remove(user.sub, id);
  }

  //Get Bookmarks for Admin and moderator
  @Get()
  @Roles('ADMIN', 'MODERATOR')
  @Permissions('view_all_bookmarks')
  getAll() {
    return this.bookmarkService.getAll();
  }
}
