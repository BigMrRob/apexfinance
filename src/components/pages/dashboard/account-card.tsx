"use client";
import React from "react";
import { Button, Card, Metric, Text } from "@tremor/react";
import { PlaidAccount, PlaidBalance } from "@prisma/client";
import { CircleX } from "lucide-react";
import { trpc } from "~/lib/trpc/client";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
export interface PlaidAccountWithBalances extends PlaidAccount {
  balances: PlaidBalance;
}

const AccountCard = ({ account }: { account: PlaidAccountWithBalances }) => {
  const { mutate: deleteAccount } = trpc.plaid.plaidAccountDelete.useMutation();

  const deleteAccountHandler = async () => {
    await deleteAccount(account.id);
  };

  return (
    <li key={account.id}>
      <Card
        className="mx-auto max-w-xs relative"
        decoration="top"
        decorationColor="indigo"
      >
        <Button
          icon={CircleX}
          iconPosition="right"
          variant="light"
          className="absolute top-2 right-2 text-red-500"
          onClick={deleteAccountHandler}
        ></Button>
        <Text className="text-xl font-semibold">{account.name}</Text>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-10">
          Available Balance:{" "}
        </p>
        <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
          {formatter.format(account.balances?.available || 0)}
        </p>
      </Card>
    </li>
  );
};

export default AccountCard;
