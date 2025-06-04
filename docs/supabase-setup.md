# Supabase Setup Guide
## TIA Schedule Builder Cloud Integration

### Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub or email**
4. **Create a new project:**
   - Project name: `tia-schedule-builder`
   - Database password: (generate a strong password)
   - Region: Choose closest to your location

### Step 2: Database Schema Setup

Once your project is created, go to the **SQL Editor** and run these commands:

#### Create Tables

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create schedules table
CREATE TABLE public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(month, year, created_by)
);

-- Create schedule_days table for better querying
CREATE TABLE public.schedule_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    total_hours DECIMAL(4,2) DEFAULT 0,
    staff JSONB DEFAULT '[]'::jsonb,
    events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(schedule_id, day_number)
);

-- Create reports table for sharing
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    share_token VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_schedules_user ON public.schedules(created_by);
CREATE INDEX idx_schedules_date ON public.schedules(year, month);
CREATE INDEX idx_schedule_days_schedule ON public.schedule_days(schedule_id);
CREATE INDEX idx_reports_token ON public.reports(share_token);
```

#### Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY "Users can view their own schedules" ON public.schedules
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own schedules" ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own schedules" ON public.schedules
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own schedules" ON public.schedules
    FOR DELETE USING (auth.uid() = created_by);

-- Schedule days policies
CREATE POLICY "Users can view their schedule days" ON public.schedule_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_days.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert their schedule days" ON public.schedule_days
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_days.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update their schedule days" ON public.schedule_days
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_days.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete their schedule days" ON public.schedule_days
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = schedule_days.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );

-- Reports policies
CREATE POLICY "Users can view their reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = reports.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );

CREATE POLICY "Public can view shared reports" ON public.reports
    FOR SELECT USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Users can insert their reports" ON public.reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.schedules 
            WHERE schedules.id = reports.schedule_id 
            AND schedules.created_by = auth.uid()
        )
    );
```

#### Create Functions for Real-time Updates

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_schedules_updated_at 
    BEFORE UPDATE ON public.schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_days_updated_at 
    BEFORE UPDATE ON public.schedule_days 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Storage Setup (for reports)

1. **Go to Storage in Supabase dashboard**
2. **Create a new bucket:**
   - Name: `reports`
   - Public: `true` (for sharing reports)
3. **Set up storage policies:**

```sql
-- Storage policies for reports bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

CREATE POLICY "Users can upload their reports" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their reports" ON storage.objects
    FOR SELECT USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view shared reports" ON storage.objects
    FOR SELECT USING (bucket_id = 'reports');
```

### Step 4: Authentication Setup

1. **Go to Authentication > Settings**
2. **Configure email settings:**
   - Enable email confirmations: `false` (for magic links)
   - Enable email change confirmations: `true`
3. **Set up magic link template (optional):**
   - Customize the email template for sign-in links

### Step 5: Get API Keys

1. **Go to Settings > API**
2. **Copy these values:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anon public key: `eyJ...` (long string)

### Step 6: Environment Configuration

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:3001
```

### Step 7: Test the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Click the sync status indicator
   - Try signing in with your email
   - Check your email for the magic link

3. **Test data sync:**
   - Make changes to the schedule
   - Open the app in another browser/device
   - Verify changes sync in real-time

### Troubleshooting

#### Common Issues:

1. **"Invalid API key" error:**
   - Check that your `.env` file is in the project root
   - Verify the API key is correct (no extra spaces)
   - Restart your development server

2. **"Row Level Security" errors:**
   - Make sure you're signed in
   - Check that RLS policies are set up correctly
   - Verify the user ID matches in the database

3. **Real-time not working:**
   - Check browser console for WebSocket errors
   - Verify your Supabase project has real-time enabled
   - Make sure you're on the same network/not behind a firewall

4. **Storage upload errors:**
   - Check storage bucket permissions
   - Verify the bucket is public if sharing reports
   - Make sure storage policies are set up correctly

### Production Deployment

For production deployment to Vercel:

1. **Add environment variables in Vercel dashboard:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (your production domain)

2. **Update CORS settings in Supabase:**
   - Go to Authentication > Settings
   - Add your production domain to allowed origins

3. **Set up custom domain (optional):**
   - Configure your domain in Vercel
   - Update `VITE_APP_URL` to your custom domain

### Security Best Practices

1. **Never commit `.env` files to git**
2. **Use Row Level Security for all tables**
3. **Regularly rotate API keys if compromised**
4. **Set up proper CORS origins for production**
5. **Monitor usage in Supabase dashboard**

### Cost Management

- **Free tier limits:**
  - 50,000 monthly active users
  - 500MB database storage
  - 1GB file storage
  - 2GB bandwidth

- **Upgrade triggers:**
  - More than 50k users per month
  - Database size > 500MB
  - High bandwidth usage

The free tier should be sufficient for most museum operations!
