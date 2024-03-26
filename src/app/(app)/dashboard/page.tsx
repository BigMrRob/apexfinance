import { LinkTokenCreateResponse, Products } from "plaid";
import SignIn from "~/components/auth/SignIn";

import PlaidLink from "~/components/plaid/plaid-link";
import { getUserAuth } from "~/lib/auth/utils";
import { api } from "~/lib/trpc/api";
import Accounts from "./accounts";

export default async function Home() {
  const { session } = await getUserAuth();

  const linkTokenCreateResponse: LinkTokenCreateResponse =
    await api.plaid.createLinkToken.query({
      id: session?.user.id || "",
      name: session?.user.name || "",
      products: [Products.Transactions],
    });

  return (
    <main className="space-y-4">
      <Accounts
        id={session?.user.id!}
        linkTokenCreateResponse={linkTokenCreateResponse}
      />
      <SignIn />
    </main>
  );
}
