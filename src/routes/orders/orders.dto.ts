import { createZodDto } from "nestjs-zod";
import {
  CreateOrderBodySchema,
  GetOrdersQuerySchema,
  GetOrderParamsSchema,
  UpdateOrderStatusBodySchema,
  PayOrderBodySchema,
  GetOrderResponseSchema,
  GetOrdersResponseSchema,
} from "./orders.model";

export class CreateOrderBodyDto extends createZodDto(CreateOrderBodySchema) {}
export class GetOrdersQueryDto extends createZodDto(GetOrdersQuerySchema) {}
export class GetOrderParamsDto extends createZodDto(GetOrderParamsSchema) {}
export class UpdateOrderStatusBodyDto extends createZodDto(UpdateOrderStatusBodySchema) {}
export class PayOrderBodyDto extends createZodDto(PayOrderBodySchema) {}
export class GetOrderResponseDto extends createZodDto(GetOrderResponseSchema) {}
export class GetOrdersResponseDto extends createZodDto(GetOrdersResponseSchema) {}

