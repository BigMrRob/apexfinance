import {
  CompletePlaidAccount,
  relatedPlaidAccountSchema,
} from "./../../../../prisma/zod/plaidaccount";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { plaidClient } from "~/lib/plaid/plaid-client";
import {
  CountryCode,
  ItemPublicTokenExchangeRequest,
  LinkTokenCreateRequest,
  Products,
} from "plaid";
import { TRPCError } from "@trpc/server";
import {
  plaidAccountSchema,
  plaidInstitutionSchema,
  relatedPlaidInstitutionSchema,
  userSchema,
} from "~/zodAutoGenSchemas";
import { db } from "~/lib/db";
import { Prisma, PlaidAccount, PlaidBalance } from "@prisma/client";

type PlaidAccountWithBalances = PlaidAccount & {
  balances: PlaidBalance;
};

export const plaidRouter = router({
  createLinkToken: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        id: z.string().min(1),
        products: z.array(z.nativeEnum(Products)),
      })
    )
    .query(async ({ input }) => {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: input.id,
        },
        client_name: input.name,
        products: input.products,
        country_codes: [CountryCode.Us],
        language: "en",
      };

      const response = await plaidClient.linkTokenCreate(request);

      return response.data;
    }),

  exchangePublicToken: protectedProcedure
    .input(
      z.object({
        publicToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const request: ItemPublicTokenExchangeRequest = {
        public_token: input.publicToken,
      };
      try {
        const response = await plaidClient.itemPublicTokenExchange(request);
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        return { accessToken, itemId };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error exchanging public token",
        });
      }
    }),
  plaidAccountsGet: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await plaidClient.accountsGet({
          access_token: input.accessToken,
        });
        return response.data.accounts;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating new plaid item",
        });
      }
    }),
  plaidDBAccountsGet: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await db.plaidAccount.findMany({
          where: { userId: input.userId },
          include: { balances: true, institution: true },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating new plaid item",
        });
      }
    }),
  plaidInstitutionCreate: protectedProcedure
    .input(
      z.object({
        user: userSchema,
        accounts: z.array(relatedPlaidAccountSchema),
        institution: plaidInstitutionSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const institution = await db.$transaction(async (prisma) => {
          const upsertedInstitution = await prisma.plaidInstitution.upsert({
            where: { institutionId: input.institution.institutionId },
            update: { name: input.institution.name },
            create: {
              institutionId: input.institution.institutionId,
              name: input.institution.name,
            },
          });

          for (const account of input.accounts as PlaidAccountWithBalances[]) {
            const upsertedAccount = await prisma.plaidAccount.upsert({
              where: { id: account.id },
              update: {
                name: account.name,
                mask: account.mask,
                officialName: account.officialName,
                subtype: account.subtype,
                type: account.type,
                institutionId: upsertedInstitution.institutionId,
                userId: input.user.id,
              },
              create: {
                id: account.id,
                accessToken: account.accessToken,
                name: account.name,
                mask: account.mask,
                officialName: account.officialName,
                subtype: account.subtype,
                type: account.type,
                institutionId: upsertedInstitution.institutionId,
                userId: input.user.id,
              },
            });

            if (account.balances) {
              console.log("here");
              await prisma.plaidBalance.upsert({
                where: { plaidAccountId: upsertedAccount.id }, // Use the ID of the upserted account
                update: {
                  available: account.balances.available,
                  current: account.balances.current,
                  limit: account.balances.limit || null,
                  isoCurrencyCode: account.balances.isoCurrencyCode,
                  unofficialCurrencyCode:
                    account.balances.unofficialCurrencyCode || null,
                },
                create: {
                  plaidAccountId: upsertedAccount.id, // Link to the newly created/updated PlaidAccount
                  available: account.balances.available,
                  current: account.balances.current,
                  limit: account.balances.limit || null,
                  isoCurrencyCode: account.balances.isoCurrencyCode,
                  unofficialCurrencyCode:
                    account.balances.unofficialCurrencyCode || null,
                },
              });
            }
          }

          return upsertedInstitution;
        });
        return institution;
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating new plaid item",
        });
      }
    }),

  plaidAccountDelete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await db.plaidAccount.delete({
        where: { id: input },
      });
    }),
});
