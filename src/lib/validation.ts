import { z } from "zod";

export const emailSchema = z.string().trim().email();

export const passwordSchema = z.string().min(8).max(128);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(120),
});
