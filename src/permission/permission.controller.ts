import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  //  Create Permission
  @Post()
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionService.createPermission(dto);
  }

  // Get All Permissions
  @Get()
  getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  // Get Single Permission
  @Get(':id')
  getPermission(@Param('id') id: string) {
    return this.permissionService.getPermissionById(id);
  }

  // Update Permission
  @Patch(':id')
  updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.updatePermission(id, dto);
  }

  // Delete Permission
  @Delete(':id')
  deletePermission(@Param('id') id: string) {
    return this.permissionService.deletePermission(id);
  }
}
