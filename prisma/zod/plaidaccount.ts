import * as z from "zod"
import { CompletePlaidBalance, relatedPlaidBalanceSchema, CompletePlaidInstitution, relatedPlaidInstitutionSchema, CompleteUser, relatedUserSchema } from "./index"

export const plaidAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mask: z.string(),
  name: z.string(),
  accessToken: z.string(),
  officialName: z.string().nullish(),
  subtype: z.string(),
  type: z.string(),
  institutionId: z.string(),
  persistentAccountId: z.string().nullish(),
})

export interface CompletePlaidAccount extends z.infer<typeof plaidAccountSchema> {
  balances?: CompletePlaidBalance | null
  institution: CompletePlaidInstitution
  user: CompleteUser
}

/**
 * relatedPlaidAccountSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidAccountSchema: z.ZodSchema<CompletePlaidAccount> = z.lazy(() => plaidAccountSchema.extend({
  balances: relatedPlaidBalanceSchema.nullish(),
  institution: relatedPlaidInstitutionSchema,
  user: relatedUserSchema,
}))
