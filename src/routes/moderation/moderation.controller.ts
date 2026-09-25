import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { GetIp } from "src/shared/decorator/get-ip.decorator";
import { ModerationService } from "./moderation.service";
import {
  CreateReportBodyDto,
  GetReportsQueryDto,
  ModerationListQueryDto,
  ReportParamsDto,
  ResolveReportBodyDto,
} from "./moderation.dto";

@Controller("api")
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  // Client
  @Post("reports")
  async createReport(@Body() body: CreateReportBodyDto, @ActiveUser() user: any) {
    return this.service.createReport(body as any, user.userId);
  }

  // Admin: báo cáo vi phạm
  @Get("admin/reports")
  async getReports(@Query() query: GetReportsQueryDto) {
    return this.service.getReports(query as any);
  }

  @Get("admin/reports/pending-count")
  async getPendingCount() {
    return this.service.getPendingCount();
  }

  @Put("admin/reports/:id/resolve")
  async resolveReport(
    @Param() params: ReportParamsDto,
    @Body() body: ResolveReportBodyDto,
    @ActiveUser() user: any,
    @GetIp() ip: string,
  ) {
    return this.service.resolveReport((params as any).id, body as any, user.userId, ip);
  }

  // Admin: kiểm duyệt nội dung trực tiếp
  @Get("admin/moderation/comments")
  async listComments(@Query() query: ModerationListQueryDto) {
    return this.service.listComments(query as any);
  }

  @Delete("admin/moderation/comments/:id")
  async deleteComment(@Param() params: ReportParamsDto, @ActiveUser() user: any, @GetIp() ip: string) {
    return this.service.removeContent("COMMENT", (params as any).id, user.userId, ip);
  }

  @Get("admin/moderation/questions")
  async listQuestions(@Query() query: ModerationListQueryDto) {
    return this.service.listQuestions(query as any);
  }

  @Delete("admin/moderation/questions/:id")
  async deleteQuestion(@Param() params: ReportParamsDto, @ActiveUser() user: any, @GetIp() ip: string) {
    return this.service.removeContent("LESSON_QUESTION", (params as any).id, user.userId, ip);
  }

  @Delete("admin/moderation/answers/:id")
  async deleteAnswer(@Param() params: ReportParamsDto, @ActiveUser() user: any, @GetIp() ip: string) {
    return this.service.removeContent("LESSON_ANSWER", (params as any).id, user.userId, ip);
  }
}
