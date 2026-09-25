import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { AuthModule } from "./routes/auth/auth.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { ModerationModule } from "./routes/moderation/moderation.module";
import { CouponsModule } from "./routes/coupons/coupons.module";
import { AdminAnalyticsModule } from "./routes/admin-analytics/admin-analytics.module";
import { BullModule } from "@nestjs/bullmq";
import { AuditInterceptor } from "./shared/interceptor/audit.interceptor";
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
import { NotificationsModule } from "./routes/notifications/notifications.module";
import { HealthModule } from "./routes/health/health.module";
import { InstructorsModule } from "./routes/instructors/instructors.module";
import { GamificationModule } from "./routes/gamification/gamification.module";
import { AuditLogModule } from "./routes/audit-log/audit-log.module";
import { LessonNotesModule } from "./routes/lesson-notes/lesson-notes.module";
import { LessonQuestionsModule } from "./routes/lesson-questions/lesson-questions.module";
import { QuizzesModule } from "./routes/quizzes/quizzes.module";
import { CourseSurveyModule } from "./routes/course-survey/course-survey.module";
import { SiteSettingsModule } from "./routes/site-settings/site-settings.module";
import { MaintenanceGuard } from "./routes/site-settings/maintenance.guard";
import { TagsModule } from "./routes/tags/tags.module";
import { LearningProfileModule } from "./routes/learning-profile/learning-profile.module";
import { EmailCampaignsModule } from "./routes/email-campaigns/email-campaigns.module";
import { AssignmentsModule } from "./routes/assignments/assignments.module";
import { InstructorStudentsModule } from "./routes/instructor-students/instructor-students.module";
import { SupportModule } from "./routes/support/support.module";
import { QueueMonitorModule } from "./routes/queue-monitor/queue-monitor.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: process.env.NODE_ENV === 'production' ? 3 : 10000 },
      { name: 'medium', ttl: 10000, limit: process.env.NODE_ENV === 'production' ? 20 : 10000 },
      { name: 'long', ttl: 60000, limit: process.env.NODE_ENV === 'production' ? 100 : 10000 },
    ]),
    // Hàng đợi BullMQ dùng chung Redis với RedisService (REDIS_URL)
    BullModule.forRootAsync({
      useFactory: () => {
        const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port) || 6379,
            username: url.username ? decodeURIComponent(url.username) : undefined,
            password: url.password ? decodeURIComponent(url.password) : undefined,
            db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
            ...(url.protocol === "rediss:" ? { tls: {} } : {}),
            maxRetriesPerRequest: null, // BullMQ yêu cầu
          },
        };
      },
    }),
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
    NotificationsModule,
    HealthModule,
    InstructorsModule,
    GamificationModule,
    AuditLogModule,
    LessonNotesModule,
    LessonQuestionsModule,
    QuizzesModule,
    CourseSurveyModule,
    ModerationModule,
    CouponsModule,
    AdminAnalyticsModule,
    SiteSettingsModule,
    TagsModule,
    LearningProfileModule,
    EmailCampaignsModule,
    AssignmentsModule,
    InstructorStudentsModule,
    SupportModule,
    QueueMonitorModule,
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
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },

    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    // Sau AuthenticationGuard (cần req.user), trước PermissionGuard
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
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
