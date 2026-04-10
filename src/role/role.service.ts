import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { roleSelect } from '../prisma/selects';
import { transformPermissions } from './utils/permission.utils';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  //-------Create Role---------------
  async createRole(dto: CreateRoleDto, userId: string) {
    //Checking if already exist then throwing error.
    const exists = await this.prisma.role.findUnique({
      where: {
        name: dto.name,
      },
    });
    if (exists) {
      throw new ConflictException('role already Exists');
    }

    //creating role from database
    const role = await this.prisma.role.create({
      data: {
        ...dto,
        createdById: userId,
      },
      select: roleSelect,
    });

    //returning response
    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  }

  //---------------Get All Roles-------------
  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      select: roleSelect,
    });

    return {
      success: true,
      message: 'Roles fetched successfully',
      data: roles,
    };
  }

  //Getting role by id
  async getRoleById(id: string) {
    //checking if not exists then throwing error
    await this.ExistsCheck(id);

    //Finding in database
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });

    //Returning Response
    return {
      success: true,
      message: 'Role fetched successfully',
      data: role,
    };
  }

  //--------Update Role--------------------
  async updateRole(id: string, dto: UpdateRoleDto) {
    //checking if not exists then throwing error
    await this.ExistsCheck(id);

    //updating in database
    const updated = await this.prisma.role.update({
      where: { id },
      data: dto,
      select: roleSelect,
    });

    //returning response
    return {
      success: true,
      message: 'Role fetched successfully',
      data: updated,
    };
  }

  //-----------Delete Role---------------
  async deleteRole(id: string) {
    //checking if not exists then throwing error
    await this.ExistsCheck(id);

    //Deleting Record from database
    const role = await this.prisma.role.delete({
      where: { id },
      select: roleSelect,
    });

    //Returning Response
    return {
      success: true,
      message: 'Role Deleted successfully',
      data: role,
    };
  }

  //--------Assign Permissions To Role-----------------
  async assignPermissions(roleId: string, permissionIds: string[]) {
    //Checking if Role Exists
    await this.ExistsCheck(roleId);

    // Checking  permissions exist
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
    const AssignedPermissions = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    //Response
    return {
      success: true,
      message: 'Role fetched successfully',
      data: AssignedPermissions,
    };
  }

  //----------Get Permission of a Role--------------
  async getPermissions(id: string) {
    //Checking if Role not exists then throwing Error
    await this.ExistsCheck(id);

    //Fetching Permissions Against The role
    const permissions = await this.prisma.role.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    //Converting Response Into Desired shape of Object
    const data = transformPermissions(permissions);

    //Returning Response
    return {
      success: true,
      message: 'Permissions Fetched Successfully',
      data: data,
    };
  }

  //-------------Helper Functions-------------------
  async ExistsCheck(id: string) {
    //checking if not exists then throwing error
    const roleId = await this.prisma.role.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });
    if (!roleId) {
      throw new NotFoundException('role not found');
    }
  }
}
