# BuildConnect - Deployment Guide

## Prerequisites Checklist

Before deploying, make sure you have:
- [ ] GitHub account (code is already pushed)
- [ ] Vercel account (sign up at vercel.com)
- [ ] Supabase account (sign up at supabase.com)
- [ ] Resend account for emails (optional, sign up at resend.com)

## Step 1: Set Up Supabase (5 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Choose organization and create new project
4. Name it "buildconnect" (or any name you prefer)
5. Set a secure database password (save this!)
6. Choose a region closest to your users
7. Click "Create new project" and wait ~2 minutes

### 1.2 Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

### 1.3 Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy these values (you'll need them for Vercel):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click to reveal)

**⚠️ IMPORTANT:** Keep the service_role key secret! Never commit it to git.

### 1.4 Configure Auth Settings

1. Go to **Authentication** > **URL Configuration**
2. Under "Site URL", you'll update this after deploying (for now, leave as localhost)
3. Under "Redirect URLs", add:
   - `http://localhost:3000/**` (for local development)
   - You'll add your Vercel URL here after deployment

## Step 2: Set Up Resend (Optional - 2 minutes)

Email notifications are optional but recommended:

1. Go to [https://resend.com](https://resend.com)
2. Sign up for free account (100 emails/day free)
3. Click **API Keys** in dashboard
4. Click **Create API Key**
5. Name it "BuildConnect"
6. Copy the API key (starts with `re_`)

**Note:** If you skip this, the app will work but won't send email notifications.

## Step 3: Deploy to Vercel (3 minutes)

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub login for easier setup)
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository:
   - Find `Contractor-Builder-Platform`
   - Click **Import**
5. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./ (leave as is)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

6. **Add Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_URL=https://your-app.vercel.app
   RESEND_API_KEY=re_your_key_here
   ```

   **Important:**
   - Replace all placeholder values with your actual keys from Step 1 & 2
   - For `NEXT_PUBLIC_URL`, you can use `https://buildconnect.vercel.app` initially
   - You'll get the actual Vercel URL after first deployment

7. Click **Deploy**
8. Wait 2-3 minutes for deployment to complete ☕

### Option B: Deploy via CLI

If you prefer command line:

```bash
# Make sure you're in the project directory
cd /home/user/Contractor-Builder-Platform

# Login to Vercel (opens browser)
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_URL
vercel env add RESEND_API_KEY

# Deploy to production
vercel --prod
```

## Step 4: Update Configuration (2 minutes)

After your first deployment, you'll get a URL like: `https://buildconnect-abc123.vercel.app`

### 4.1 Update Vercel Environment Variable

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_URL`
4. Click **Edit** and update to your actual Vercel URL
5. Click **Save**
6. Redeploy: Go to **Deployments** → click "..." on latest → **Redeploy**

### 4.2 Update Supabase Auth URLs

1. Go back to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL** to: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/callback`

## Step 5: Test Your Deployment (5 minutes)

Visit your Vercel URL and test the complete flow:

### Test Checklist

1. **Homepage**
   - [ ] Landing page loads correctly
   - [ ] "Post a Project" and "Find Work" buttons work

2. **Sign Up as Builder**
   - [ ] Click "Sign Up" → Select "Builder"
   - [ ] Fill in all fields (use a real email)
   - [ ] Click "Create Account"
   - [ ] Should redirect to `/builder/dashboard`

3. **Post a Project**
   - [ ] Click "Post New Project"
   - [ ] Fill in all required fields
   - [ ] Click "Post Project"
   - [ ] Should see project in dashboard

4. **Sign Up as Contractor** (use incognito/different browser)
   - [ ] Sign up as contractor
   - [ ] Should redirect to `/contractor/dashboard`
   - [ ] Should see the posted project in "Browse Projects"

5. **Submit a Bid**
   - [ ] Click on the project
   - [ ] Fill in bid form (price, duration, proposal)
   - [ ] Click "Submit Bid"
   - [ ] Should see success message

6. **Accept Bid** (switch back to builder account)
   - [ ] Go to your project
   - [ ] Should see the bid
   - [ ] Click "Accept Bid"
   - [ ] Project status should change to "Awarded"

7. **Verify Email** (if Resend is configured)
   - [ ] Builder should receive "New bid received" email
   - [ ] Contractor should receive "Bid accepted" email

## Troubleshooting

### Build Fails on Vercel

**Error:** "MODULE_NOT_FOUND"
- **Solution:** Make sure all dependencies are in `package.json`
- Redeploy after pushing any fixes

**Error:** "Type errors"
- **Solution:** Run `npm run build` locally first to catch errors
- Fix any TypeScript errors before deploying

### Can't Log In

**Error:** "Invalid login credentials"
- **Solution:**
  - Check Supabase is running (not paused)
  - Verify environment variables are correct
  - Try password reset

### Pages Load but Database Errors

**Error:** "Failed to fetch" or "RLS policy violation"
- **Solution:**
  - Verify database schema was run successfully
  - Check RLS policies are enabled
  - Verify API keys in Vercel environment variables

### Email Notifications Not Working

- Check RESEND_API_KEY is set correctly
- Verify email domain in Resend dashboard
- Check Resend logs for delivery status
- **Note:** App works fine without emails

### Environment Variables Not Working

- Make sure you're editing the right environment (Production)
- Redeploy after changing environment variables
- Clear browser cache and try again

## Custom Domain (Optional)

Want to use your own domain like `buildconnect.com`?

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow Vercel's instructions to update DNS settings
5. Wait for DNS propagation (5-60 minutes)
6. Update `NEXT_PUBLIC_URL` environment variable
7. Update Supabase Auth URLs with new domain

## Production Checklist

Before announcing to users:

- [ ] All test scenarios pass
- [ ] Email notifications work (or disabled gracefully)
- [ ] Mobile responsive design verified
- [ ] Database backups enabled in Supabase
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Analytics configured (optional: Google Analytics)

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor deployment status
- Check build logs
- View analytics (if enabled)
- Manage environment variables

### Supabase Dashboard
- Monitor database usage
- Check authentication logs
- View API requests
- Set up database backups

### Regular Tasks
- Check error logs weekly
- Monitor database size
- Review user feedback
- Update dependencies monthly

## Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console for errors
4. Check GitHub issues in repository
5. Reach out for support

## Success! 🎉

Your BuildConnect platform is now live and ready for users!

**Next Steps:**
1. Share the URL with test users
2. Gather feedback
3. Monitor usage and performance
4. Plan feature enhancements

---

**Deployment Date:** ___________
**Vercel URL:** ___________
**Supabase Project:** ___________
