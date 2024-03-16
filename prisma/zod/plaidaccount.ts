import * as z from "zod"
import { CompleteUser, relatedUserSchema, CompletePlaidBalance, relatedPlaidBalanceSchema, CompletePlaidInstitution, relatedPlaidInstitutionSchema } from "./index"

export const plaidAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mask: z.string(),
  name: z.string(),
  officialName: z.string().nullish(),
  subtype: z.string(),
  type: z.string(),
  institutionId: z.string(),
  persistentAccountId: z.string().nullish(),
})

export interface CompletePlaidAccount extends z.infer<typeof plaidAccountSchema> {
  user: CompleteUser
  balances: CompletePlaidBalance
  institution: CompletePlaidInstitution
}

/**
 * relatedPlaidAccountSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidAccountSchema: z.ZodSchema<CompletePlaidAccount> = z.lazy(() => plaidAccountSchema.extend({
  user: relatedUserSchema,
  balances: relatedPlaidBalanceSchema,
  institution: relatedPlaidInstitutionSchema,
}))
