import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(40),
  email: z.string().email().optional().or(z.literal("")),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().max(2000).optional(),
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
