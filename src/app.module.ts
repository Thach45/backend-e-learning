import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./routes/auth/auth.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { AuthenticationGuard } from "./shared/guards/authentication.guard";
import { PermissionModule } from "./routes/permission/permission.module";
import { TransformInterceptor } from "./shared/interceptor/transform.interceptor";
import { LoggingInterceptor } from "./shared/interceptor/logging.interceptor";
import { CategoriesModule } from "./routes/categories/categories.module";
import { RolesModule } from "./routes/roles/roles.module";
import { CoursesModule } from "./routes/courses/courses.module";
import { PermissionGuard } from "./shared/guards/permission.guard";
import { UsersModule } from "./routes/users/users.module";
import { CourseDetailModule } from "./routes/course-detail/course-detail.module";
import { CourseContentModule } from "./routes/course-content/course-content.module";
import { LessonsModule } from "./routes/lessons/lessons.module";
import { EnrollmentsModule } from "./routes/enrollments/enrollments.module";
import { ReviewsModule } from "./routes/reviews/reviews.module";
import { WishlistModule } from "./routes/wishlist/wishlist.module";
import { UploadModule } from "./routes/upload/upload.module";
import { CartModule } from "./routes/cart/cart.module";
import { OrdersModule } from "./routes/orders/orders.module";
import { CommentsModule } from "./routes/comments/comments.module";
import { DocumentCategoriesModule } from "./routes/document-categories/document-categories.module";
import { DocumentTagsModule } from "./routes/document-tags/document-tags.module";
import { DocumentsModule } from "./routes/documents/documents.module";
import { DashboardModule } from "./routes/dashboard/dashboard.module";
import { InstructorModule } from "./routes/instructor/instructor.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { UserThrottlerGuard } from "./shared/guards/throttler.guard";
import { RealtimeModule } from "./realtime/core/realtime.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    SharedModule,
    AuthModule,
    PermissionModule,
    CategoriesModule,
    RolesModule,
    UsersModule,
    CoursesModule,
    CourseDetailModule,
    CourseContentModule,
    LessonsModule,
    EnrollmentsModule,
    ReviewsModule,
    WishlistModule,
    UploadModule,
    CartModule,
    OrdersModule,
    CommentsModule,
    DocumentCategoriesModule,
    DocumentTagsModule,
    DocumentsModule,
    DashboardModule,
    InstructorModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
  ],
})
export class AppModule {}
