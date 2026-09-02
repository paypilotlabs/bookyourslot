import { z } from "zod";

export const ZAdminCreateTeamSchema = z.object({
  name: z.string().min(1),
  // Reaches the public booker as a URL segment, so keep it to what survives a URL untouched.
  slug: z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens"),
  ownerId: z.number().int().positive(),
  memberIds: z.array(z.number().int().positive()).max(100).default([]),
});

export type TAdminCreateTeamSchema = z.infer<typeof ZAdminCreateTeamSchema>;
