import { z } from "zod";

export const emailSchema = z.string().trim().email();

export const passwordSchema = z.string().min(8).max(128);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
