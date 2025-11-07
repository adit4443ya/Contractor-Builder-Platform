# 🚀 Quick Deploy to Vercel - 5 Minutes

## You Need (Get these first):

### 1. Supabase Credentials (2 minutes to get)

**Create Supabase Project:**
- Go to https://supabase.com/dashboard
- Click "New Project"
- Name: "buildconnect"
- Wait 2 minutes for setup

**Get Your Keys:**
- Go to Settings → API
- Copy these 2 keys:

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGci...
```

**Run Database Schema:**
- Go to SQL Editor
- Copy entire contents from `supabase-schema.sql`
- Paste and click Run

### 2. Deploy to Vercel (3 minutes)

**Go to:** https://vercel.com/new

**Import Repository:**
- Connect GitHub
- Select: `Contractor-Builder-Platform`

**Add Environment Variables:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_URL=https://buildconnect.vercel.app
RESEND_API_KEY=re_your_key_here
```

**Click Deploy** → Wait 2 minutes ☕

## After First Deploy:

1. **Get your Vercel URL** (like: buildconnect-xyz.vercel.app)

2. **Update in Vercel:**
   - Settings → Environment Variables
   - Edit `NEXT_PUBLIC_URL` with your actual URL
   - Redeploy

3. **Update in Supabase:**
   - Auth → URL Configuration
   - Site URL: your-vercel-url
   - Redirect URLs: your-vercel-url/**

## Test:
- Open your Vercel URL
- Sign up as Builder
- Post a project
- Sign up as Contractor (incognito)
- Submit a bid
- Accept the bid

✅ **Done! Your platform is live!**

---

Need help? Check `DEPLOYMENT.md` for detailed troubleshooting.
