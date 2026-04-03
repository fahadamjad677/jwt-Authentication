import { Injectable } from '@nestjs/common';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  // Create Permission
  // createPermission(dto: CreatePermissionDto) {
  //   return this.prisma.permission.create({
  //     data: {
  //       ...dto,
  //     },
  //   });
  // }

  createPermission(dto: CreatePermissionDto) {
    return this.prisma.permission.upsert({
      where: {
        resource_action: {
          resource: dto.resource,
          action: dto.action,
        },
      },
      update: {},
      create: {
        name: `${dto.resource}:${dto.action}`,
        resource: dto.resource,
        action: dto.action,
      },
    });
  }

  // Get All
  getAllPermissions() {
    return this.prisma.permission.findMany();
  }

  //Get One
  getPermissionById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  //Update
  updatePermission(id: string, dto: UpdatePermissionDto) {
    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  // Delete
  deletePermission(id: string) {
    return this.prisma.permission.delete({
      where: { id },
    });
  }
}
