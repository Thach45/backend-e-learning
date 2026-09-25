import { createZodDto } from "nestjs-zod";
import {
  CreateCouponBodySchema,
  UpdateCouponBodySchema,
  GetCouponsQuerySchema,
  CouponParamsSchema,
  ValidateCouponBodySchema,
} from "./coupons.model";

export class CreateCouponBodyDto extends createZodDto(CreateCouponBodySchema) {}
export class UpdateCouponBodyDto extends createZodDto(UpdateCouponBodySchema) {}
export class GetCouponsQueryDto extends createZodDto(GetCouponsQuerySchema) {}
export class CouponParamsDto extends createZodDto(CouponParamsSchema) {}
export class ValidateCouponBodyDto extends createZodDto(ValidateCouponBodySchema) {}
