import * as z from "zod"
import { CompletePlaidInstitution, relatedPlaidInstitutionSchema, CompletePlaidAccount, relatedPlaidAccountSchema, CompleteUser, relatedUserSchema } from "./index"

export const plaidItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accessToken: z.string(),
  itemId: z.string(),
  institutionId: z.string(),
})

export interface CompletePlaidItem extends z.infer<typeof plaidItemSchema> {
  institution: CompletePlaidInstitution
  accounts: CompletePlaidAccount[]
  user: CompleteUser
}

/**
 * relatedPlaidItemSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidItemSchema: z.ZodSchema<CompletePlaidItem> = z.lazy(() => plaidItemSchema.extend({
  institution: relatedPlaidInstitutionSchema,
  accounts: relatedPlaidAccountSchema.array(),
  user: relatedUserSchema,
}))
