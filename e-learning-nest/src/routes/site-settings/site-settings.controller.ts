import { Body, Controller, Get, Put } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { SiteSettingsService } from "./site-settings.service";
import {
  AdminSiteSettingsResponseDto,
  PublicSiteSettingsResponseDto,
  UpdateSiteSettingsBodyDto,
} from "./site-settings.dto";

@Controller("api")
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  /** Công khai: link mạng xã hội (footer) và trạng thái bảo trì (giao diện dùng để hiện layout bảo trì). */
  @Public()
  @Get("settings/public")
  @ZodSerializerDto(PublicSiteSettingsResponseDto)
  async getPublic() {
    return this.service.getPublic();
  }

  @Get("admin/settings")
  @ZodSerializerDto(AdminSiteSettingsResponseDto)
  async getAdmin() {
    return this.service.getSettings();
  }

  @Put("admin/settings")
  @Audit("site.settings.update", "SiteSetting")
  @ZodSerializerDto(AdminSiteSettingsResponseDto)
  async update(@Body() body: UpdateSiteSettingsBodyDto, @ActiveUser() user: any) {
    return this.service.update(body, user.userId);
  }
}
