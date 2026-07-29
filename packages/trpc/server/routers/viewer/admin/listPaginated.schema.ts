import { z } from "zod";

export const ZListMembersSchema = z.object({
  limit: z.number().min(1).max(100),
  cursor: z.number().nullish(),
  searchTerm: z.string().nullish(),
  /** Filter to accounts waiting for approval (locked) or already active. */
  locked: z.boolean().nullish(),
});

export type TListMembersSchema = z.infer<typeof ZListMembersSchema>;
