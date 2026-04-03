import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';

import { RolePermissionService } from './role-permission.service';
import { AssignPermissionDto, ReplacePermissionsDto } from './dto';
@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly service: RolePermissionService) {}

  // Assign Permission
  @Post('assign')
  assignPermission(@Body() dto: AssignPermissionDto) {
    return this.service.assignPermission(dto.roleId, dto.permissionId);
  }

  //  Remove Permission
  @Delete(':roleId/:permissionId')
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.service.removePermission(roleId, permissionId);
  }

  // Get Permissions of Role
  @Get(':roleId')
  getPermissions(@Param('roleId') roleId: string) {
    return this.service.getPermissionsByRole(roleId);
  }

  // Replace Permissions (BEST PRACTICE)
  @Post('replace')
  replacePermissions(@Body() dto: ReplacePermissionsDto) {
    return this.service.replacePermissions(dto.roleId, dto.permissionIds);
  }
}
