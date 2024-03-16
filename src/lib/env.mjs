import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    PLAID_CLIENT_ID: z.string().min(1),
    PLAID_SECRET: z.string().min(1),
    PLAID_ENV_URL: z.string().min(1),
    POSTGRES_URL: z.string().min(1),
    POSTGRES_PRISMA_URL: z.string().min(1),
    POSTGRES_URL_NO_SSL: z.string().min(1),
    POSTGRES_URL_NON_POOLING: z.string().min(1),
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
  },
});
