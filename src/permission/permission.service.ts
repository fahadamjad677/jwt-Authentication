import { Injectable } from '@nestjs/common';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  //Create Permission
  createPermission(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: {
        resource: dto.resource,
        action: dto.action,
        name: `${dto.resource}:${dto.action}`,
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
