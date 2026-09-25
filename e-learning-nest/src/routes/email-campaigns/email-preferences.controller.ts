import { BadRequestException, Body, Controller, Get, HttpCode, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { PrismaService } from "src/shared/service/prisma.service";
import { verifyUnsubscribeToken } from "./unsubscribe-token.util";
import { UnsubscribeQueryDto, UnsubscribeTokenBodyDto, UpdateEmailPreferencesBodyDto } from "./email-campaigns.dto";

const mask = (e: string) => e.replace(/^(.).*(@.*)$/, "$1***$2");

/**
 * Từ chối nhận thư thông báo/chiến dịch. Thư giao dịch (OTP, đơn hàng, cảnh báo đăng nhập) KHÔNG bị ảnh hưởng.
 * Liên kết trong thư mang token ký HMAC nên không cần đăng nhập và không đoán/giả mạo được.
 */
@Controller("api")
export class EmailPreferencesController {
  constructor(private readonly prisma: PrismaService) {}

  private userIdFromToken(token: string | undefined) {
    const userId = verifyUnsubscribeToken(token);
    if (!userId) throw new BadRequestException("Liên kết không hợp lệ hoặc đã bị chỉnh sửa");
    return userId;
  }

  /** Trang xác nhận: cho biết địa chỉ (che bớt) và trạng thái hiện tại. */
  @Public()
  @Get("email/unsubscribe")
  async info(@Query() q: UnsubscribeQueryDto) {
    const userId = this.userIdFromToken(q.token);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailCampaignOptOut: true } });
    if (!user) throw new BadRequestException("Liên kết không hợp lệ");
    return { email: mask(user.email), optedOut: user.emailCampaignOptOut };
  }

  /** Cũng là đích của "List-Unsubscribe-Post" (bấm một chạm): token nằm trên query, thân form không dùng tới. */
  @Public()
  @Post("email/unsubscribe")
  @HttpCode(200)
  async unsubscribe(@Query() q: UnsubscribeQueryDto, @Body() body: UnsubscribeTokenBodyDto) {
    const userId = this.userIdFromToken(q.token ?? body?.token);
    await this.prisma.user.updateMany({ where: { id: userId, emailCampaignOptOut: false }, data: { emailCampaignOptOut: true, emailOptOutAt: new Date() } });
    return { optedOut: true };
  }

  @Public()
  @Post("email/resubscribe")
  @HttpCode(200)
  async resubscribe(@Query() q: UnsubscribeQueryDto, @Body() body: UnsubscribeTokenBodyDto) {
    const userId = this.userIdFromToken(q.token ?? body?.token);
    await this.prisma.user.updateMany({ where: { id: userId }, data: { emailCampaignOptOut: false, emailOptOutAt: null } });
    return { optedOut: false };
  }

  @Get("email/preferences")
  async getPreferences(@ActiveUser() user: any) {
    const u = await this.prisma.user.findUnique({ where: { id: user.userId }, select: { emailCampaignOptOut: true } });
    return { campaignEmails: !(u?.emailCampaignOptOut ?? false) };
  }

  @Put("email/preferences")
  async updatePreferences(@Body() body: UpdateEmailPreferencesBodyDto, @ActiveUser() user: any) {
    await this.prisma.user.update({
      where: { id: user.userId },
      data: body.campaignEmails ? { emailCampaignOptOut: false, emailOptOutAt: null } : { emailCampaignOptOut: true, emailOptOutAt: new Date() },
    });
    return { campaignEmails: body.campaignEmails };
  }
}
