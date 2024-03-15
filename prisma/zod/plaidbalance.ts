import * as z from "zod"
import { CompletePlaidAccount, relatedPlaidAccountSchema } from "./index"

export const plaidBalanceSchema = z.object({
  id: z.string(),
  available: z.number(),
  current: z.number(),
  limit: z.number().nullish(),
  isoCurrencyCode: z.string(),
  unofficialCurrencyCode: z.string().nullish(),
  accountId: z.string().nullish(),
})

export interface CompletePlaidBalance extends z.infer<typeof plaidBalanceSchema> {
  account?: CompletePlaidAccount | null
}

/**
 * relatedPlaidBalanceSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidBalanceSchema: z.ZodSchema<CompletePlaidBalance> = z.lazy(() => plaidBalanceSchema.extend({
  account: relatedPlaidAccountSchema.nullish(),
}))
