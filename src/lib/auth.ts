import bcrypt from "bcrypt";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["ADMIN", "TEACHER"],
        required: false,
        defaultValue: "TEACHER",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
});
