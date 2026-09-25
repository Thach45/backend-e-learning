import { createZodDto } from "nestjs-zod";
import {
  CampaignIdParamsSchema,
  CreateCampaignBodySchema,
  ListCampaignsQuerySchema,
  RejectCampaignBodySchema,
  SendCampaignBodySchema,
  UnsubscribeQuerySchema,
  UnsubscribeTokenBodySchema,
  UpdateCampaignBodySchema,
  UpdateEmailPreferencesBodySchema,
} from "./email-campaigns.model";

export class CreateCampaignBodyDto extends createZodDto(CreateCampaignBodySchema) {}
export class UpdateCampaignBodyDto extends createZodDto(UpdateCampaignBodySchema) {}
export class ListCampaignsQueryDto extends createZodDto(ListCampaignsQuerySchema) {}
export class CampaignIdParamsDto extends createZodDto(CampaignIdParamsSchema) {}
export class RejectCampaignBodyDto extends createZodDto(RejectCampaignBodySchema) {}
export class SendCampaignBodyDto extends createZodDto(SendCampaignBodySchema) {}
export class UnsubscribeTokenBodyDto extends createZodDto(UnsubscribeTokenBodySchema) {}
export class UnsubscribeQueryDto extends createZodDto(UnsubscribeQuerySchema) {}
export class UpdateEmailPreferencesBodyDto extends createZodDto(UpdateEmailPreferencesBodySchema) {}
