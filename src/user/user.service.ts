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
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
// import { Prisma } from 'src/generated/prisma/client';

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
  async getAllUsers(cursorpaginationDto: CursorPaginationDto) {
    //Extracting Cursor and limit from dto
    const { cursor, limit } = cursorpaginationDto;

    //Later Ask Junaid Bhaii for this..
    // const query: Prisma.UserFindManyArgs = {
    //   take: limit + 1, //Taking limit + 1 to check if the next record exists
    //   where: {
    //     isDeleted: false,
    //   },
    //   orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    //   select: userSelect,
    // };

    // //cursor Exisits then Adding Cursor in dataBase Query
    // if (cursor) {
    //   query.cursor = { id: cursor };
    //   query.skip = 1;
    // }

    // const users = await this.prisma.user.findMany(query);

    const users = await this.prisma.user.findMany({
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      where: {
        isDeleted: false,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: userSelect,
    });

    // Cursor handling
    let nextCursor: string | null = null;

    if (users.length > limit) {
      users.pop();
      nextCursor = users[users.length - 1].id;
    }
    //Shaping Data
    const usersResponse = transformUsers(users);

    // Returning Response
    return {
      success: true,
      message: 'User fetched Successfully',
      data: usersResponse,
      meta: {
        limit,
        nextCursor,
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
