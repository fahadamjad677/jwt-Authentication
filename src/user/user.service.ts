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
import { PaginationDto } from './dto';

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
  async getAllUsers(paginationdata: PaginationDto) {
    //Extracting page,limit
    const { page, limit } = paginationdata;
    const skip = (page - 1) * limit;

    //Using promise.all to run queries in parallel for faster response
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: {
          isDeleted: false,
        },
        select: userSelect,
        orderBy: {
          //Using orderBy to get Consistent Records.
          createdAt: 'desc',
        },
      }),

      this.prisma.user.count({
        where: {
          isDeleted: false,
        },
      }),
    ]);

    //Handling if pages > totalPages
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages && total > 0) {
      throw new NotFoundException('pages not found');
    }

    //Shaping User response
    const usersResponse = transformUsers(users);

    // Returning Response
    return {
      success: true,
      message: 'User fetched Successfully',
      data: usersResponse,
      meta: {
        page,
        limit,
        total,
        totalPages: totalPages,
      },
    };
  }

  //--------Getting Single User---------------
  async getUserById(id: string) {
    //Checking if not Exists then throwing Error
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userResponse = transformUsers(user);
    // Returning Response
    return {
      success: true,
      message: 'User fetched Successfully',
      data: userResponse,
    };
  }

  //----------Updating User---------------
  async updateUser(id: string, dto: UpdateUserDto) {
    //Checking if not exists then throwing Error
    const exists = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
      },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }

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
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    //Deleting from database
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    //Shaping User into simple Api object
    //Returning Response
    return {
      success: true,
      message: 'User deleted Successfully',
    };
  }
}
