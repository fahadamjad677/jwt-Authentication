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
} from '@nestjs/common';

import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CsrfGuard, jwtAcessGuard } from 'src/auth/guard';
import { GetUser } from '../user/decorator';

@UseGuards(jwtAcessGuard, CsrfGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  //  Create Permission
  @Post()
  createPermission(
    @Body() dto: CreatePermissionDto,
    @GetUser('sub') createrid: string,
  ) {
    return this.permissionService.createPermission(dto, createrid);
  }

  // Get All Permissions
  @Get()
  getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  // Get Single Permission
  @Get(':id')
  getPermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.getPermissionById(id);
  }

  // Update Permission
  @Patch(':id')
  updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(id, dto);
  }

  // Delete Permission
  @Delete(':id')
  deletePermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.deletePermission(id);
  }
}
