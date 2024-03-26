"use client";
import { Session } from "next-auth";
import React from "react";
import { trpc } from "~/lib/trpc/client";
import AccountCard, {
  PlaidAccountWithBalances,
} from "~/components/pages/dashboard/account-card";
import { PlaidAccount } from "@prisma/client";
import PlaidLink from "~/components/plaid/plaid-link";
import _ from "lodash";
import { BeatLoader } from "react-spinners";

const Accounts = ({
  id,
  linkTokenCreateResponse,
}: {
  id: string;
  linkTokenCreateResponse: { link_token: string };
}) => {
  const accounts = trpc.plaid.plaidDBAccountsGet.useQuery({
    userId: id,
  });

  const grouped = _.groupBy(accounts.data, (item) => item.institution.name);

  return (
    <>
      <div className="flex gap-10 items-center">
        <h2>Connected Accounts</h2>
        <PlaidLink
          linkToken={linkTokenCreateResponse.link_token}
          refetch={accounts.refetch}
        />
      </div>
      {accounts.isFetching ? (
        <BeatLoader />
      ) : (
        Object.keys(grouped).map((key) => {
          return (
            <div key={key}>
              <h3 className="text-3xl py-2 mt-10">{key}</h3>
              <ul className="grid grid-cols-5 gap-5">
                {grouped[key].map((account: PlaidAccount) => {
                  return (
                    <AccountCard
                      key={account.id}
                      account={account as PlaidAccountWithBalances}
                      refetch={accounts.refetch}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </>
  );
};

export default Accounts;
