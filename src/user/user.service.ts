import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

export const userSelect = {
  id: true,
  email: true,
  roleId: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //Create User
  async createUser(dto: CreateUserDto, createdById: string) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
        createdById,
      },
      select: userSelect,
    });
  }

  // Get All Users
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: userSelect,
    });
  }

  //Get Single User
  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  //Update User
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const updatedData: UpdateUserDto = { ...dto };

    // Hash password if updating
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: userSelect,
    });
  }

  //Soft Delete User
  async softDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
