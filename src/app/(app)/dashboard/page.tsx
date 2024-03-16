import { LinkTokenCreateResponse, Products } from "plaid";
import SignIn from "~/components/auth/SignIn";
import AccountCard, {
  PlaidAccountWithBalances,
} from "~/components/pages/dashboard/account-card";
import PlaidLink from "~/components/plaid/plaid-link";
import { getUserAuth } from "~/lib/auth/utils";
import { api } from "~/lib/trpc/api";
import { PlaidAccount } from "@prisma/client";

export default async function Home() {
  const { session } = await getUserAuth();

  const linkTokenCreateResponse: LinkTokenCreateResponse =
    await api.plaid.createLinkToken.query({
      id: session?.user.id || "",
      name: session?.user.name || "",
      products: [Products.Transactions],
    });
  const accounts = await api.plaid.plaidDBAccountsGet.query({
    userId: session?.user.id!,
  });

  return (
    <main className="space-y-4">
      <div className="flex gap-10 items-center">
        <h2>Connected Accounts</h2>
        <PlaidLink linkToken={linkTokenCreateResponse.link_token} />
      </div>
      <ul className="grid grid-cols-5 gap-5">
        {accounts.map((account: PlaidAccount) => {
          console.log(account);
          return (
            <AccountCard
              key={account.id}
              account={account as PlaidAccountWithBalances}
            />
          );
        })}
      </ul>
      <SignIn />
    </main>
  );
}
