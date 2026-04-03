import { Injectable } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  createRole(dto: CreateRoleDto, userId: string) {
    return this.prisma.role.create({
      data: {
        ...dto,
        createdById: userId,
      },
    });
  }

  getAllRoles() {
    return this.prisma.role.findMany();
  }

  getRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  updateRole(id: string, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  deleteRole(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
