import { z } from "zod";

// --- Enums ---
export const MarketStatusSchema = z.enum(["draft", "active", "closed", "resolved", "cancelled"]);
export const PredictionStatusSchema = z.enum(["active", "locked", "scored"]);

// --- User Schema ---
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  avatarUrl: z.string().url().nullable().optional(),
  totalPoints: z.number().int().nonnegative().default(0),
  accuracy: z.number().min(0).max(100).default(0),
  rank: z.number().int().positive().nullable().optional(),
});

// --- Market Schema (Creation) ---
export const CreateMarketSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  description: z.string().optional(),
  category: z.string(),
  endTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "End time must be in the future",
  }),
  seasonId: z.string().cuid().optional(),
});

// --- Prediction Schema (The core logic) ---
export const CreatePredictionSchema = z.object({
  marketId: z.string().cuid(),
  outcomeId: z.string().cuid(),
  confidence: z.number().int().min(1).max(100),
});

// --- Types derived from Zod ---
export type CreatePredictionInput = z.infer<typeof CreatePredictionSchema>;
export type UserProfile = z.infer<typeof UserSchema>;