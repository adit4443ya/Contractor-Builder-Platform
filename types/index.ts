export type UserType = 'builder' | 'contractor'

export type ProjectStatus = 'open' | 'bidding_closed' | 'awarded' | 'completed' | 'cancelled'

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type ProjectType = 'residential' | 'commercial' | 'infrastructure' | 'renovation'

export const CITIES = [
  'Patna',
  'Lucknow',
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
] as const

export const SPECIALIZATIONS = [
  'Civil',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Masonry',
  'Painting',
  'Flooring',
  'Roofing',
  'HVAC',
  'Interior Design',
] as const

export type City = typeof CITIES[number]
export type Specialization = typeof SPECIALIZATIONS[number]
