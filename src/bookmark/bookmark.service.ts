import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto } from './dto';
import { UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  //Create Bookmark (all roles can use)
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

  //Get all bookmarks for current User
  async findAll(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (bookmarks.length === 0) {
      throw new NotFoundException('bookmarks not found ');
    }
    return bookmarks;
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

  // async update(userId: string, bookmarkId: string, dto: UpdateBookmarkDto) {
  //   const bookmark = await this.prisma.bookmark.update({
  //     where: { id: bookmarkId, userId },
  //     data: dto,
  //   });
  //   console.log(bookmark);
  //   return bookmark;
  // }

  async update(userId: string, bookmarkId: string, dto: UpdateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: dto,
    });
  }
  async remove(userId: string, bookmarkId: string) {
    return this.prisma.bookmark.delete({
      where: { id: bookmarkId, userId },
    });
  }

  async getAll() {
    const bookmarks = await this.prisma.bookmark.findMany();
    if (bookmarks.length === 0) {
      throw new NotFoundException('bookmarks Empty');
    }
    return bookmarks;
  }
}
