"use client";
import React from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { Button } from "../ui/button";
import { onPlaidLinkSuccess } from "~/app/actions";

const PlaidLink = ({
  linkToken,
  refetch,
}: {
  linkToken: string;
  refetch: () => void;
}) => {
  const config: PlaidLinkOptions = {
    onSuccess: async (public_token, metadata) => {
      const response = await onPlaidLinkSuccess(public_token, metadata);
      if (response) {
        refetch();
      }
    },
    token: linkToken,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <Button onClick={() => open()} disabled={!ready}>
      Add New Account
    </Button>
  );
};

export default PlaidLink;
