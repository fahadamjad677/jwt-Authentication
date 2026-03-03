import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Role } from '../generated/prisma/enums';
import { PayloadUser } from 'src/auth/types';

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

  async UpdateRole(targetId: string, targetRole: Role, user: PayloadUser) {
    //user cannot change its own role.
    if (user.sub === targetId) {
      throw new ForbiddenException('cannot change your own role');
    }

    //Now getting the target User
    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const roleHierarchy = {
      USER: 1,
      MODERATOR: 2,
      ADMIN: 3,
    };

    //Cannot Change Role Greater than you..
    if (roleHierarchy[targetUser.role] >= roleHierarchy[user.role]) {
      throw new ForbiddenException(
        'You cannot modify a user with equal or higher role',
      );
    }

    // Cannot assign role equal or higher than yourself
    if (roleHierarchy[targetRole] >= roleHierarchy[user.role]) {
      throw new ForbiddenException(
        'You cannot assign a role equal or higher than yours',
      );
    }
  }
}
