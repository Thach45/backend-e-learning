import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { EmailCampaignsService } from "./email-campaigns.service";
import {
  CampaignIdParamsDto,
  CreateCampaignBodyDto,
  ListCampaignsQueryDto,
  RejectCampaignBodyDto,
  SendCampaignBodyDto,
  UpdateCampaignBodyDto,
} from "./email-campaigns.dto";

/**
 * Kênh email. Quyền vai trò (ADMIN/INSTRUCTOR, chủ sở hữu, đối tượng được phép) kiểm tra trong service.
 * Route duyệt/từ chối nằm dưới /admin/... nên mặc định chỉ ADMIN.
 */
@Controller("api")
export class EmailCampaignsController {
  constructor(private readonly service: EmailCampaignsService) {}

  @Post("email-campaigns")
  @Audit("email-campaign.create", "EmailCampaign")
  create(@Body() body: CreateCampaignBodyDto, @ActiveUser() user: any) {
    return this.service.create(user, body);
  }

  @Get("email-campaigns")
  list(@Query() query: ListCampaignsQueryDto, @ActiveUser() user: any) {
    return this.service.list(user, query);
  }

  @Get("email-campaigns/:id")
  get(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.get(user, p.id);
  }

  @Put("email-campaigns/:id")
  @Audit("email-campaign.update", "EmailCampaign")
  update(@Param() p: CampaignIdParamsDto, @Body() body: UpdateCampaignBodyDto, @ActiveUser() user: any) {
    return this.service.update(user, p.id, body);
  }

  @Delete("email-campaigns/:id")
  @Audit("email-campaign.delete", "EmailCampaign")
  remove(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.remove(user, p.id);
  }

  @Post("email-campaigns/:id/preview-audience")
  previewAudience(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.previewAudience(user, p.id);
  }

  @Post("email-campaigns/:id/test-send")
  testSend(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.testSend(user, p.id);
  }

  @Post("email-campaigns/:id/submit")
  @Audit("email-campaign.submit", "EmailCampaign")
  submit(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.submit(user, p.id);
  }

  @Post("admin/email-campaigns/:id/approve")
  @Audit("email-campaign.approve", "EmailCampaign")
  approve(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.approve(user, p.id);
  }

  @Post("admin/email-campaigns/:id/reject")
  @Audit("email-campaign.reject", "EmailCampaign")
  reject(@Param() p: CampaignIdParamsDto, @Body() body: RejectCampaignBodyDto, @ActiveUser() user: any) {
    return this.service.reject(user, p.id, body.reason);
  }

  @Post("email-campaigns/:id/send")
  @Audit("email-campaign.send", "EmailCampaign")
  send(@Param() p: CampaignIdParamsDto, @Body() body: SendCampaignBodyDto, @ActiveUser() user: any) {
    return this.service.send(user, p.id, body.scheduledAt);
  }

  @Post("email-campaigns/:id/cancel")
  @Audit("email-campaign.cancel", "EmailCampaign")
  cancel(@Param() p: CampaignIdParamsDto, @ActiveUser() user: any) {
    return this.service.cancel(user, p.id);
  }
}
