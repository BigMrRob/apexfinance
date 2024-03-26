"use server";

import { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { api } from "~/lib/trpc/api";
import { PlaidInstitution } from "@prisma/client";
import { CompletePlaidInstitution } from "prisma/zod/plaidinstitution";
import { CompletePlaidAccount } from "prisma/zod/plaidaccount";
import { getUserAuth } from "~/lib/auth/utils";
import { User } from "@prisma/client";
import { CompleteUser } from "prisma/zod/user";

export async function onPlaidLinkSuccess(
  public_token: string,
  metadata: PlaidLinkOnSuccessMetadata
) {
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
    plaidAccounts: [],
    sessions: [],
  };

  const accountsResponse = await api.plaid.plaidAccountsGet.query({
    accessToken: exchangePublicTokenResponse.accessToken,
  });

  const accounts = accountsResponse.map((account) => {
    return {
      ...account,
      id: account.account_id,
      accessToken: exchangePublicTokenResponse.accessToken,
      institutionId: metadata.institution?.institution_id!,
      userId: user.id,
      mask: account.mask || "",
      subtype: account.subtype || "",
      institution: {
        institutionId: metadata.institution?.institution_id!,
        name: metadata.institution?.name!,
        accounts: [],
      },
      balances: {
        available: account.balances.available || 0,
        current: account.balances.current || 0,
        limit: account.balances.limit || 0,
        isoCurrencyCode: "USD",
        id: "",
        plaidAccountId: account.account_id,
        plaidAccount: {
          id: account.account_id,
          institutionId: metadata.institution?.institution_id!,
          userId: user.id,
          user,
          accessToken: exchangePublicTokenResponse.accessToken,
          type: account.type,
          name: account.name,
          officialName: account.official_name || "",
          mask: account.mask || "",
          subtype: account.subtype || "",
          institution: {
            institutionId: metadata.institution?.institution_id!,
            name: metadata.institution?.name!,
            accounts: [],
          },
        },
      },
      user,
    };
  });

  const institution: PlaidInstitution = {
    institutionId: metadata.institution?.institution_id!,
    name: metadata.institution?.name!,
  };

  const plaidInstitutionCreateResponse =
    await api.plaid.plaidInstitutionCreate.mutate({
      user,
      accounts,
      institution,
    });

  return plaidInstitutionCreateResponse;
}
