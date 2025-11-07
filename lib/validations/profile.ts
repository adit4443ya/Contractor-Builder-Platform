import { z } from 'zod'

export const contractorProfileSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  companyName: z.string().min(2, 'Company name is required'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  experienceYears: z.number().min(0).max(50).optional(),
  teamSize: z.number().min(1).max(10000).optional(),
  serviceLocations: z.array(z.string()).min(1, 'Select at least one service location'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  portfolioImages: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').optional(),
})

export type ContractorProfileInput = z.infer<typeof contractorProfileSchema>
