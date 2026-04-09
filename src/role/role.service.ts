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

  async assignPermissions(roleId: string, permissionIds: string[]) {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Validate permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('Some permissions are invalid');
    }

    // 3 Transaction: replace permissions
    await this.prisma.$transaction([
      // remove old
      this.prisma.rolePermission.deleteMany({
        where: { roleId },
      }),

      // add new
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        skipDuplicates: true,
      }),
    ]);

    // Return updated role with permissions
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
