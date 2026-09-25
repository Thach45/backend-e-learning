import { createZodDto } from "nestjs-zod";
import {
  CreateTicketBodySchema,
  FaqCategoryBodySchema,
  FaqCategoryUpdateBodySchema,
  FaqItemBodySchema,
  FaqItemUpdateBodySchema,
  FaqQuerySchema,
  FaqReorderBodySchema,
  IdParamsSchema,
  ListTicketsQuerySchema,
  PostMessageBodySchema,
  UpdateTicketBodySchema,
} from "./support.model";

export class IdParamsDto extends createZodDto(IdParamsSchema) {}
export class CreateTicketBodyDto extends createZodDto(CreateTicketBodySchema) {}
export class PostMessageBodyDto extends createZodDto(PostMessageBodySchema) {}
export class ListTicketsQueryDto extends createZodDto(ListTicketsQuerySchema) {}
export class UpdateTicketBodyDto extends createZodDto(UpdateTicketBodySchema) {}
export class FaqCategoryBodyDto extends createZodDto(FaqCategoryBodySchema) {}
export class FaqCategoryUpdateBodyDto extends createZodDto(FaqCategoryUpdateBodySchema) {}
export class FaqItemBodyDto extends createZodDto(FaqItemBodySchema) {}
export class FaqItemUpdateBodyDto extends createZodDto(FaqItemUpdateBodySchema) {}
export class FaqReorderBodyDto extends createZodDto(FaqReorderBodySchema) {}
export class FaqQueryDto extends createZodDto(FaqQuerySchema) {}
