import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { isRoleType, PayloadUser } from '../auth/types';
import { Prisma } from '../generated/prisma/client';

//These is the Fields which we will select
export const userSelect = {
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
} satisfies Prisma.UserSelect;

const roleSelect = {
  id: true,
  name: true,
} satisfies Prisma.RoleSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  //Get User
  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  //Update The User
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  //Delete The user
  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  //Get All The users In database.
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('users not found');
    }
    return users;
  }

  async updateRole(targetId: string, targetRole: string, user: PayloadUser) {
    //  Cannot change your own role
    if (user.sub === targetId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    // Get target user WITH role
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetId },
      include: {
        role: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const newRole = await this.prisma.role.findUnique({
      where: { name: targetRole },
      select: roleSelect,
    });

    if (!newRole || !isRoleType(newRole.name)) {
      throw new NotFoundException('Role not found or invalid');
    }

    if (!isRoleType(targetUser.role.name)) {
      throw new ForbiddenException('Invalid role in database');
    }

    //Role hierarchy (string-based now)
    const roleHierarchy: Record<string, number> = {
      user: 1,
      moderator: 2,
      admin: 3,
    };

    const currentUserLevel = roleHierarchy[user.role];
    const targetUserLevel = roleHierarchy[targetUser.role.name];
    const newRoleLevel = roleHierarchy[targetRole];

    // Cannot modify equal/higher user
    if (targetUserLevel >= currentUserLevel) {
      throw new ForbiddenException(
        'You cannot modify a user with equal or higher role',
      );
    }

    //  Cannot assign equal/higher role
    if (newRoleLevel >= currentUserLevel) {
      throw new ForbiddenException(
        'You cannot assign a role equal or higher than yours',
      );
    }

    //  Update role
    return this.prisma.user.update({
      where: { id: targetId },
      data: {
        roleId: newRole.id,
      },
      select: userSelect,
    });
  }
}
