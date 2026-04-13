import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { userSelect } from '../prisma/selects';
import { transformUsers } from './utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //------------Create User------------------
  async createUser(dto: CreateUserDto, createdById: string) {
    // Check email uniqueness of exists then throwing Error
    //There is some problem of isDelete Scenario later ask Junaid Bhai
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    //Creating User
    const User = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
        createdById,
      },
      select: userSelect,
    });

    //Shaping the object
    const userResponse = transformUsers(User);

    //Returning Response
    return {
      success: true,
      message: 'User Created Successfully',
      data: userResponse,
    };
  }

  //-------Getting All Users----------------
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: userSelect,
    });
    if (users) {
      const usersResponse = transformUsers(users);
      // Returning Response
      return {
        success: true,
        message: 'User fetched Successfully',
        data: usersResponse,
      };
    }

    return {
      success: false,
      message: 'Users not found',
      data: users,
    };
  }

  //--------Getting Single User---------------
  async getUserById(id: string) {
    //Checking if not Exists then throwing Error
    const exists = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        isDeleted: true,
      },
    });

    if (!exists || exists.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Getting User from Database
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: userSelect,
    });

    if (user) {
      const userResponse = transformUsers(user);
      // Returning Response
      return {
        success: true,
        message: 'User fetched Successfully',
        data: userResponse,
      };
    }

    return {
      success: false,
      message: 'User not found',
      data: user,
    };
  }

  //----------Updating User---------------
  async updateUser(id: string, dto: UpdateUserDto) {
    //Checking if not exists then throwing Error
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        isDeleted: true,
      },
    });

    if (!exists || exists.isDeleted) {
      throw new NotFoundException('User not found');
    }

    //later ask junaid bhaii can we directly update dto validated data.
    const updatedData: UpdateUserDto = { ...dto };

    // Hash password if updating
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 10);
    }

    //Updating User in database
    const user = await this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: userSelect,
    });

    const userResponse = transformUsers(user);
    //Returning Response
    return {
      success: true,
      message: 'User updated Successfully',
      data: userResponse,
    };
  }

  //------Soft Delete user--------------
  async softDeleteUser(id: string) {
    //Checking if not exists then throwing Error
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    //Deleting from database
    const deleted = await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
      select: userSelect,
    });

    //Shaping User into simple Api object
    const userResponse = transformUsers(deleted);
    //Returning Response
    return {
      success: true,
      message: 'User deleted Successfully',
      data: userResponse,
    };
  }
}
