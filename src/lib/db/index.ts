import { PrismaClient } from "@prisma/client";
import { withPulse } from "@prisma/extension-pulse";
import { env } from "../env.mjs";

export const db = new PrismaClient().$extends(
  withPulse({
    apiKey: env.PULSE_API_KEY,
  })
);
