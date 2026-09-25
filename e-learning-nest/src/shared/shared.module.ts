import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from './service/prisma.service';
import { HashingService } from './service/hashing.service';
import { TokenService } from './service/token.service';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AccessTokenGuard } from './guards/auth.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { SharedUserRepo } from './repositories/shared-user.repo';
import { SendEmailService } from './service/send-email.service';
import { PermissionGuard } from './guards/permission.guard';
import { RedisService } from './service/redis.service';
import { AppLogger } from './service/logging.service';
import { R2Service } from './service/r2.service';
import { AuditLogService } from './service/audit-log.service';
import { MAIL_QUEUE } from './mail/mail.constants';
import { MailProcessor } from './mail/mail.processor';

const sharedServices = [
    PrismaService,
    HashingService,
    TokenService,
    ApiKeyGuard,
    AccessTokenGuard,
    AuthenticationGuard,
    SharedUserRepo,
    SendEmailService,
    PermissionGuard,
    AppLogger,
    RedisService,
    R2Service,
    AuditLogService,
];
@Global()
@Module({
    // MailProcessor chỉ cần đăng ký (worker tự chạy), không cần export
    providers: [...sharedServices, MailProcessor],
    exports: sharedServices,
    imports: [JwtModule, BullModule.registerQueue({ name: MAIL_QUEUE })],
})
export class SharedModule {}
