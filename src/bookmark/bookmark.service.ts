import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto } from './dto';
import { UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        title: dto.title,
        description: dto.description,
        url: dto.url,
        userId: userId,
      },
    });
  }

  async findAll(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (bookmarks.length === 0) {
      throw new NotFoundException('bookmarks not found ');
    }
  }

  async findOne(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    return bookmark;
  }

  async update(userId: string, bookmarkId: string, dto: UpdateBookmarkDto) {
    return await this.prisma.bookmark.update({
      where: { id: bookmarkId, userId },
      data: dto,
    });
  }

  async remove(userId: string, bookmarkId: string) {
    return this.prisma.bookmark.delete({
      where: { id: bookmarkId, userId },
    });
  }
}
