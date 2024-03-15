import { PlaidApi } from "plaid";
import { configuration } from "./plaid-configuration";

export const plaidClient = new PlaidApi(configuration);
