import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { CsrfGuard, jwtAcessGuard, RolesGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { Roles } from '../auth/decorator';
import { AssignPermissionsDto } from './dto';

@UseGuards(jwtAcessGuard, CsrfGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  //Create Role
  @HttpCode(HttpStatus.OK)
  @Post()
  createRole(@Body() dto: CreateRoleDto, @GetUser('sub') userId: string) {
    return this.roleService.createRole(dto, userId);
  }

  //All Roles
  @Get()
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  //Get role By ID
  @Get(':id')
  getRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.getRoleById(id);
  }

  //Update Role
  @Patch(':id')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, dto);
  }

  //Delete Role
  @Delete(':id')
  deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.deleteRole(id);
  }

  //Assign Role
  @Post(':id/permissions')
  assignPermissions(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(roleId, dto.permissionIds);
  }

  //Get Permission of Role
  @Get(':id/permissions')
  getPermissions(@Param('id', ParseUUIDPipe) roleId: string) {
    return this.roleService.getPermissionsByRoleId(roleId);
  }
}
