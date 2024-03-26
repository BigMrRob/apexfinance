import { TransactionsGetRequest } from "plaid";
import React from "react";
import { db } from "~/lib/db";
import { plaidClient } from "~/lib/plaid/plaid-client";

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  console.log(1);
  const account = await db.plaidAccount.findUnique({
    where: {
      id,
    },
  });
  const request: TransactionsGetRequest = {
    access_token: account?.accessToken!,
    start_date: "2018-01-01",
    end_date: "2020-02-01",
  };
  const transactions = await plaidClient.transactionsGet(request);

  console.log(transactions.data.accounts);

  return <div>Page</div>;
};

export default Page;
