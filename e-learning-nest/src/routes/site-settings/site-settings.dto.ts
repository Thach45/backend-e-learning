import { createZodDto } from "nestjs-zod";
import {
  AdminSiteSettingsResponseSchema,
  PublicSiteSettingsResponseSchema,
  UpdateSiteSettingsBodySchema,
} from "./site-settings.model";

export class UpdateSiteSettingsBodyDto extends createZodDto(UpdateSiteSettingsBodySchema) {}
export class AdminSiteSettingsResponseDto extends createZodDto(AdminSiteSettingsResponseSchema) {}
export class PublicSiteSettingsResponseDto extends createZodDto(PublicSiteSettingsResponseSchema) {}
