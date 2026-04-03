import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolePermissionService {
  constructor(private prisma: PrismaService) {}

  // Assign Permission to Role
  async assignPermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  //Remove Permission from Role
  async removePermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  //Get All Permissions of a Role
  async getPermissionsByRole(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }

  //Replace All Permissions (IMPORTANT)
  async replacePermissions(roleId: string, permissionIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1 Delete existing
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 2 Insert new
      await tx.rolePermission.createMany({
        data: permissionIds.map((pid) => ({
          roleId,
          permissionId: pid,
        })),
        skipDuplicates: true,
      });

      return { message: 'Permissions replaced successfully' };
    });
  }
}
