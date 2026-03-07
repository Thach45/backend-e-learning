import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionRepo } from './permission.repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepo],
})
export class PermissionModule {}
