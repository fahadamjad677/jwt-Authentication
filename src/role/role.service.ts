import { Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

const roleSelect = {
  id: true,
  name: true,
  type: true,
} satisfies Prisma.RoleSelect;
@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  createRole(dto: CreateRoleDto, userId: string) {
    return this.prisma.role.create({
      data: {
        ...dto,
        createdById: userId,
      },
      select: roleSelect,
    });
  }

  getAllRoles() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  getRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });
  }

  updateRole(id: string, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: dto,
      select: roleSelect,
    });
  }

  deleteRole(id: string) {
    return this.prisma.role.delete({
      where: { id },
      select: roleSelect,
    });
  }
}
