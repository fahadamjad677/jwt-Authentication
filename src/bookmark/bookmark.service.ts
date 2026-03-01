import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException();
    }

    return bookmark;
  }

  async update(userId: string, bookmarkId: string, dto: UpdateBookmarkDto) {
    await this.findOne(userId, bookmarkId);

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: dto,
    });
  }

  async remove(userId: string, bookmarkId: string) {
    await this.findOne(userId, bookmarkId);

    return this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
