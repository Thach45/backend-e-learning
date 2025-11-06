import {  Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthenticationGuard } from './shared/guards/authentication.guard';
import { PermissionModule } from './routes/permission/permission.module';
import { TransformInterceptor } from './shared/interceptor/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor';
import { CategoriesModule } from './routes/categories/categories.module';
import { RolesModule } from './routes/roles/roles.module';
import { CoursesModule } from './routes/courses/courses.module';
import { PermissionGuard } from './shared/guards/permission.guard';
import { UsersModule } from './routes/users/users.module';
import { CourseDetailModule } from './routes/course-detail/course-detail.module';

@Module({
  imports: [SharedModule, AuthModule, PermissionModule, CategoriesModule, RolesModule, UsersModule, CoursesModule, CourseDetailModule],
  controllers: [AppController],
  providers: [AppService,
    {
    provide: APP_PIPE,
    useClass: ZodValidationPipe,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ZodSerializerInterceptor,
  },
  
  {
    provide: APP_GUARD,
    useClass: AuthenticationGuard,
  },
  {
    provide: APP_GUARD,
    useClass: PermissionGuard,
  },
  ],
})
export class AppModule {}
