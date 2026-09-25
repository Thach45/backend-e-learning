import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepo } from './roles.repo';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [RolesController],
    providers: [RolesService, RolesRepo],
})
export class RolesModule {}

