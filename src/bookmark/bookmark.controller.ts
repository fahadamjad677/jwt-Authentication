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

import { jwtAcessGuard } from '../auth/guard/jwtAccessGuard';
import { GetUser } from '../user/decorator/getUser.decorator';
import type { PayloadUser } from '../auth/types';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto';
import { UpdateBookmarkDto } from './dto';

@UseGuards(jwtAcessGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  // Create bookmark

  @Post()
  create(@GetUser() user: PayloadUser, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.create(user.sub, dto);
  }

  //Get all bookmarks for current user

  @Get()
  findAll(@GetUser() user: PayloadUser) {
    return this.bookmarkService.findAll(user.sub);
  }

  // Get single bookmark

  @Get(':id')
  findOne(
    @GetUser() user: PayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookmarkService.findOne(user.sub, id);
  }

  //Update bookmark

  @Patch(':id')
  update(
    @GetUser() user: PayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.update(user.sub, id, dto);
  }

  //Delete bookmark

  @Delete(':id')
  remove(@GetUser() user: PayloadUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookmarkService.remove(user.sub, id);
  }
}
