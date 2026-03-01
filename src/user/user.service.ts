import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Get User
  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,

        bookmarks: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  //Update The User
  async updateUser(id: string, dto: UpdateUserDto) {
    await this.getById(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,

        bookmarks: {
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  //Delete The user
  async deleteUser(id: string) {
    await this.getById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  //Get All The users In database.
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
      },
    });
  }
}
