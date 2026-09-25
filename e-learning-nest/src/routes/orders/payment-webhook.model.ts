import { z } from "zod";

// Payload SePay gửi tới webhook (https://docs.sepay.vn/tich-hop-webhooks.html).
// passthrough: SePay có thể thêm trường mới, không được vì vậy mà từ chối giao dịch.
export const SepayWebhookPayloadSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    gateway: z.string().nullish(),
    transactionDate: z.string().nullish(),
    accountNumber: z.string().nullish(),
    subAccount: z.string().nullish(),
    code: z.string().nullish(),
    content: z.string().nullish(),
    transferType: z.string(),
    description: z.string().nullish(),
    transferAmount: z.coerce.number(),
    accumulated: z.coerce.number().nullish(),
    referenceCode: z.string().nullish(),
  })
  .passthrough();

export type SepayWebhookPayload = z.infer<typeof SepayWebhookPayloadSchema>;
