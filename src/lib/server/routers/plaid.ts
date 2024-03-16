import { CompletePlaidAccount } from "./../../../../prisma/zod/plaidaccount";
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
          include: { balances: true },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating new plaid item",
        });
      }
    }),
  plaidInstitutionCreate: protectedProcedure
    .input(relatedPlaidInstitutionSchema)
    .mutation(async ({ input }) => {
      try {
        const institution = await db.$transaction(async (prisma) => {
          // Upsert institution
          const upsertedInstitution = await prisma.plaidInstitution.upsert({
            where: { institutionId: input.institutionId! },
            update: { name: input.name },
            create: {
              institutionId: input.institutionId!,
              name: input.name,
            },
          });

          // Iterate over accounts to upsert them including their balances
          for (const account of input.accounts) {
            await prisma.plaidAccount.upsert({
              where: { id: account.id },
              update: {
                mask: account.mask,
                name: account.name,
                subtype: account.subtype,
                type: account.type,
                institutionId: upsertedInstitution.institutionId,
                userId: account.userId,
              },
              create: {
                id: account.id,
                mask: account.mask,
                name: account.name,
                officialName: account.officialName || null,
                subtype: account.subtype,
                type: account.type,
                institutionId: upsertedInstitution.institutionId,
                userId: account.userId,
              },
            });
            if (account.balances) {
              await prisma.plaidBalance.upsert({
                where: { id: account.id },
                update: {
                  available: account.balances.available,
                  current: account.balances.current,
                  limit: account.balances.limit || null,
                  isoCurrencyCode: account.balances.isoCurrencyCode,
                  unofficialCurrencyCode:
                    account.balances.unofficialCurrencyCode || null,
                },
                create: {
                  accountId: account.id,
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to create/upsert institution with related accounts and balances.",
        });
      }
    }),
  plaidAccountDelete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      console.log(input);

      try {
        return await db.plaidAccount.delete({
          where: { id: input },
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete plaid account",
        });
      }
    }),
});
