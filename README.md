# BuildConnect - Construction Marketplace MVP

A digital marketplace connecting construction builders with contractors through a transparent tender bidding system.

## Features

### For Builders
- **Post Projects**: Create detailed project listings with budget, location, and requirements
- **Receive Bids**: Get competitive bids from verified contractors
- **Compare & Select**: Review contractor profiles, ratings, and proposals
- **Award Projects**: Accept bids and manage project awards

### For Contractors
- **Browse Projects**: Find relevant construction projects in your area
- **Submit Bids**: Propose your price and timeline with detailed proposals
- **Track Status**: Monitor all your bids in one place
- **Build Reputation**: Earn ratings and grow your business

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Resend account for emails ([resend.com](https://resend.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd Contractor-Builder-Platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Go to SQL Editor and run the schema from `supabase-schema.sql`
4. Enable Row Level Security (RLS) is configured automatically by the schema

### 3. Configure Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_URL=http://localhost:3000

# Email (Resend) - Optional for development
RESEND_API_KEY=re_your_resend_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Database Schema

The application uses the following main tables:

- **profiles**: User information for both builders and contractors
- **contractors**: Extended data for contractors (specializations, ratings, etc.)
- **projects**: Construction projects posted by builders
- **bids**: Bids submitted by contractors on projects
- **reviews**: Ratings and reviews for contractors

See `supabase-schema.sql` for the complete schema with indexes and RLS policies.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Important: Update URLs

After deployment, update:
- `NEXT_PUBLIC_URL` in Vercel environment variables
- Supabase Auth > URL Configuration > Site URL to your Vercel domain

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── builder/         # Builder portal pages
│   ├── contractor/      # Contractor portal pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── layout/          # Shared layout components (Sidebar)
├── lib/
│   ├── supabase/        # Supabase client configuration
│   ├── validations/     # Zod validation schemas
│   ├── email.ts         # Email notification functions
│   └── utils.ts         # Utility functions
├── types/
│   ├── database.types.ts # Generated Supabase types
│   └── index.ts         # Custom type definitions
└── supabase-schema.sql  # Database schema
```

## User Flows

### Builder Flow
1. Sign up as Builder
2. Post a project with details
3. Receive bids from contractors
4. Review and compare bids
5. Accept the best bid
6. Project status updates to "Awarded"

### Contractor Flow
1. Sign up as Contractor
2. Browse open projects
3. Submit bids with proposals
4. Track bid status
5. If accepted, start working on project

## Features Implemented

✅ Authentication (signup/login) with role-based access
✅ Builder dashboard with project statistics
✅ Post new projects with full details
✅ View all builder projects with filters
✅ Project detail page with bids management
✅ Accept/reject bids functionality
✅ Contractor dashboard with recommendations
✅ Browse all open projects
✅ Submit bids with proposals
✅ Track all submitted bids
✅ Profile pages for both user types
✅ Responsive design (mobile & desktop)
✅ Email notifications (bid received, bid accepted)
✅ Row Level Security (RLS) policies
✅ Form validation with Zod

## Future Enhancements (V2)

- Real-time chat between builders and contractors
- Payment gateway integration
- Document signing
- Advanced search and filters
- Contractor verification system
- Project milestones and progress tracking
- Photo/video uploads for portfolios
- Reviews and ratings system completion
- Mobile app (React Native)

## Testing

### Manual Test Checklist

1. **Signup & Login**
   - Create builder account
   - Create contractor account
   - Login with both accounts

2. **Builder Features**
   - Post a new project
   - View project list
   - View project details

3. **Contractor Features**
   - Browse projects
   - Submit a bid
   - View bid in "My Bids"

4. **Bid Management**
   - Builder views bids on their project
   - Builder accepts a bid
   - Contractor sees bid status update

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Supabase Connection Issues

- Verify environment variables are correct
- Check Supabase project is not paused
- Ensure RLS policies are properly configured

### Email Notifications Not Working

- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery status
- Emails are optional; app works without them

## Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and steps to reproduce

## License

This project is part of a MVP development exercise.

---

Built with ❤️ for the construction industry
