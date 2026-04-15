import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from '../prisma/prisma.service';

//resource+action to resoruce:action format
type PermissionString = `${string}:${string}`;
function toPermissionString(
  resource: string,
  action: string,
): PermissionString {
  return `${resource}:${action}`;
}

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  //Create Permission
  async createPermission(dto: CreatePermissionDto, createrId: string) {
    //checking if permission already exists then throwing error
    const exists = await this.prisma.permission.findUnique({
      where: {
        resource_action: {
          resource: dto.resource,
          action: dto.action,
        },
      },
    });
    if (exists) {
      throw new ConflictException('Permission already exists');
    }

    //Creating permission in database
    const name = toPermissionString(dto.resource, dto.action);
    const permission = await this.prisma.permission.create({
      data: {
        name,
        ...dto,
        createdById: createrId,
      },
      select: {
        name: true,
        id: true,
      },
    });

    return {
      success: true,
      message: 'Permission Created Successfully',
      data: permission,
    };
  }

  // Get All
  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      message: 'Permission fetched successfully',
      data: permissions,
    };
  }

  //Get One
  async getPermissionById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('permission not found');
    }
    return {
      success: true,
      message: 'Permission fetched successfully',
      data: permission,
    };
  }

  //Update
  async updatePermission(id: string, dto: UpdatePermissionDto) {
    //ID exists then fetching required fields otherwise error
    const existing = await this.prisma.permission.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        resource: true,
        action: true,
      },
    });

    // Merge old + new values
    const resource = dto.resource ?? existing.resource;
    const action = dto.action ?? existing.action;
    const name = toPermissionString(resource, action);

    //Updating Record
    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: {
        name: name,
        resource: resource,
        action: action,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      message: 'Permission updated successfully',
      data: updatedPermission,
    };
  }

  // Delete
  async deletePermission(id: string) {
    await this.prisma.permission.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });

    const deletedPermission = await this.prisma.permission.delete({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      message: 'Permission deleted successfully',
      data: deletedPermission,
    };
  }
}
