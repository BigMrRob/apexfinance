"use server";

import { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { api } from "~/lib/trpc/api";
import { PlaidInstitution } from "@prisma/client";
import { CompletePlaidInstitution } from "prisma/zod/plaidinstitution";
import { CompletePlaidAccount } from "prisma/zod/plaidaccount";
import { getUserAuth } from "~/lib/auth/utils";
import { CompleteUser } from "prisma/zod/user";

export async function onPlaidLinkSuccess(
  public_token: string,
  metadata: PlaidLinkOnSuccessMetadata
) {
  console.log("onSuccess", public_token, metadata);

  const exchangePublicTokenResponse = await api.plaid.exchangePublicToken.query(
    {
      publicToken: public_token,
    }
  );
  const { session } = await getUserAuth();
  const user: CompleteUser = {
    id: session?.user.id!,
    email: session?.user.email!,
    name: session?.user.name!,
    emailVerified: new Date(),
    image: "",
    accounts: [],
    sessions: [],
    plaidAccounts: [],
  };

  const accounts = await api.plaid.plaidAccountsGet.query({
    accessToken: exchangePublicTokenResponse.accessToken,
  });

  const institution: CompletePlaidInstitution = {
    institutionId: metadata.institution?.institution_id!,
    name: metadata.institution?.name!,
    accounts: accounts.map((account) => {
      const plaidAccount = {
        institution: {
          institutionId: metadata.institution?.institution_id!,
          name: metadata.institution?.name!,
          accounts: [],
        },
        type: account.type,
        name: account.name,
        accountId: account.account_id,
        mask: account.mask || "",
        subtype: account.subtype || "",
        institutionId: metadata.institution?.institution_id!,
        id: account.account_id,
        user,
        userId: session?.user.id!,
        plaidBalance: {
          available: account.balances?.available || 0,
          current: account.balances?.current || 0,
          limit: account.balances?.limit || 0,
          unofficialCurrencyCode:
            account.balances.unofficial_currency_code || "",
          plaidAccountId: account.account_id,
          id: "",
          isoCurrencyCode: "USD",
        },
        plaidBalanceId: "",
      };
      return {
        ...plaidAccount,
        plaidBalance: {
          available: account.balances?.available || 0,
          current: account.balances?.current || 0,
          limit: account.balances?.limit || 0,
          unofficialCurrencyCode:
            account.balances.unofficial_currency_code || "",
          plaidAccountId: account.account_id,
          plaidAccount,
          id: "",
          isoCurrencyCode: "USD",
        },
        plaidBalanceId: "",
      };
    }),
  };

  const plaidInstitutionCreateResponse =
    await api.plaid.plaidInstitutionCreate.mutate(institution);

  return plaidInstitutionCreateResponse;
}
