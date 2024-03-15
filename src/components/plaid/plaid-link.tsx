"use client";
import React from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { Button } from "../ui/button";
import { onPlaidLinkSuccess } from "~/app/actions";

const PlaidLink = ({ linkToken }: { linkToken: string }) => {
  const config: PlaidLinkOptions = {
    onSuccess: async (public_token, metadata) => {
      onPlaidLinkSuccess(public_token, metadata);
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
