import { router } from "~/lib/server/trpc";
import { accountRouter } from "./account";
import { plaidRouter } from "./plaid";

export const appRouter = router({
  account: accountRouter,
  plaid: plaidRouter,
});

export type AppRouter = typeof appRouter;
