import * as z from "zod"
import { CompletePlaidAccount, relatedPlaidAccountSchema } from "./index"

export const plaidBalanceSchema = z.object({
  id: z.string(),
  plaidAccountId: z.string(),
  available: z.number(),
  current: z.number(),
  limit: z.number().nullish(),
  isoCurrencyCode: z.string(),
  unofficialCurrencyCode: z.string().nullish(),
})

export interface CompletePlaidBalance extends z.infer<typeof plaidBalanceSchema> {
  plaidAccount?: CompletePlaidAccount | null
}

/**
 * relatedPlaidBalanceSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidBalanceSchema: z.ZodSchema<CompletePlaidBalance> = z.lazy(() => plaidBalanceSchema.extend({
  plaidAccount: relatedPlaidAccountSchema.nullish(),
}))
