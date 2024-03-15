import * as z from "zod"
import { CompletePlaidAccount, relatedPlaidAccountSchema } from "./index"

export const plaidInstitutionSchema = z.object({
  institutionId: z.string(),
  name: z.string(),
})

export interface CompletePlaidInstitution extends z.infer<typeof plaidInstitutionSchema> {
  accounts: CompletePlaidAccount[]
}

/**
 * relatedPlaidInstitutionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPlaidInstitutionSchema: z.ZodSchema<CompletePlaidInstitution> = z.lazy(() => plaidInstitutionSchema.extend({
  accounts: relatedPlaidAccountSchema.array(),
}))
