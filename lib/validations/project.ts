import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  projectType: z.enum(['residential', 'commercial', 'infrastructure', 'renovation'], {
    required_error: 'Project type is required',
  }),
  description: z.string().min(50, 'Description must be detailed (min 50 characters)'),
  city: z.string().min(1, 'City is required'),
  location: z.string().min(10, 'Detailed location is required'),
  requiredSpecializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  budgetMin: z.number().positive('Budget must be positive').optional(),
  budgetMax: z.number().positive('Budget must be positive').optional(),
  startDate: z.string().optional(),
  durationDays: z.number().positive().max(1000, 'Duration must be less than 1000 days').optional(),
  biddingDeadline: z.string().min(1, 'Bidding deadline is required'),
  documentUrl: z.string().url().optional().or(z.literal('')),
}).refine((data) => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax > data.budgetMin
  }
  return true
}, {
  message: "Max budget must be greater than min budget",
  path: ['budgetMax']
})

export const bidSchema = z.object({
  quotedPrice: z.number().positive('Price must be positive'),
  estimatedDuration: z.number().positive().max(365, 'Duration too long (max 365 days)'),
  proposal: z.string().min(100, 'Proposal must be detailed (min 100 characters)'),
  attachments: z.array(z.string().url()).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type BidInput = z.infer<typeof bidSchema>
