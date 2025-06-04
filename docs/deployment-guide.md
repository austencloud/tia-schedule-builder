# Deployment Guide
## TIA Schedule Builder - Cloud Deployment

### Overview

This guide will help you deploy the TIA Schedule Builder to Vercel with Supabase backend, creating a production-ready museum staffing management system.

## 🚀 Quick Deployment (5 minutes)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/tia-schedule-builder)

1. **Click the deploy button above**
2. **Connect your GitHub account**
3. **Add environment variables:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
4. **Click "Deploy"**
5. **Done!** Your app will be live in ~2 minutes

### Option 2: Manual Deployment

#### Step 1: Prepare Your Repository

```bash
# Clone or fork the repository
git clone https://github.com/your-username/tia-schedule-builder.git
cd tia-schedule-builder

# Install dependencies
npm install

# Test locally
npm run dev
```

#### Step 2: Set Up Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Configure project:**
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Step 3: Add Environment Variables

In Vercel dashboard > Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=https://your-app.vercel.app
```

#### Step 4: Deploy

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel --prod
```

Or simply push to your main branch - Vercel will auto-deploy!

## 🔧 Configuration

### Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/report/:token",
      "destination": "/report.html?token=:token"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Build Optimization

Update `vite.config.js` for production:

```javascript
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({
    configFile: './svelte.config.js'
  })],
  server: {
    port: 3000,
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@supabase/supabase-js'],
          svelte: ['svelte']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
```

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. **Go to your project in Vercel**
2. **Settings > Domains**
3. **Add your domain:** `schedule.yourmuseum.org`

### Step 2: Configure DNS

Add these DNS records with your domain provider:

```
Type: CNAME
Name: schedule
Value: cname.vercel-dns.com
```

### Step 3: Update Environment Variables

```
VITE_APP_URL=https://schedule.yourmuseum.org
```

### Step 4: Update Supabase CORS

In Supabase dashboard > Authentication > Settings:

Add your custom domain to **Site URL** and **Additional URLs**:
- `https://schedule.yourmuseum.org`

## 📊 Monitoring & Analytics

### Vercel Analytics

Add to your `app.html`:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Error Tracking with Sentry

```bash
npm install @sentry/svelte
```

Add to your main component:

```javascript
import * as Sentry from "@sentry/svelte";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## 🔒 Security Configuration

### Content Security Policy

Add to `app.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://your-project-id.supabase.co;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://your-project-id.supabase.co wss://your-project-id.supabase.co;
  font-src 'self';
">
```

### Environment Security

Never expose sensitive keys:

```javascript
// ❌ Wrong - exposes secret key
const supabase = createClient(url, secretKey);

// ✅ Correct - uses anon key
const supabase = createClient(url, anonKey);
```

## 🚀 Performance Optimization

### Progressive Web App (PWA)

Install PWA plugin:

```bash
npm install vite-plugin-pwa -D
```

Update `vite.config.js`:

```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'TIA Schedule Builder',
        short_name: 'TIA Schedule',
        description: 'Museum Staff Scheduling System',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

### Caching Strategy

```javascript
// Service worker for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Cache API responses
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## 📱 Mobile App (Optional)

### Capacitor Integration

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

Build for mobile:

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Scaling Considerations

### Database Scaling

Monitor these metrics in Supabase:

- **Active connections**
- **Database size**
- **Query performance**
- **API requests per minute**

### CDN & Caching

Vercel automatically provides:

- **Global CDN**
- **Edge caching**
- **Image optimization**
- **Automatic compression**

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test
artillery quick --count 10 --num 100 https://your-app.vercel.app
```

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build fails:**
   ```bash
   # Check build locally
   npm run build
   
   # Check for TypeScript errors
   npm run check
   ```

2. **Environment variables not working:**
   - Ensure variables start with `VITE_`
   - Redeploy after adding variables
   - Check Vercel dashboard for typos

3. **Supabase connection issues:**
   - Verify CORS settings
   - Check API keys are correct
   - Ensure RLS policies allow access

4. **Real-time not working in production:**
   - Check WebSocket connections
   - Verify Supabase real-time is enabled
   - Check browser console for errors

### Performance Issues

1. **Slow loading:**
   - Enable Vercel Analytics
   - Check bundle size with `npm run build -- --analyze`
   - Optimize images and assets

2. **Database slow queries:**
   - Check Supabase performance tab
   - Add database indexes
   - Optimize query patterns

## 🎯 Success Checklist

- [ ] App deploys successfully
- [ ] Authentication works
- [ ] Data syncs across devices
- [ ] Real-time updates work
- [ ] Reports can be generated and shared
- [ ] Mobile experience is smooth
- [ ] Custom domain configured (if desired)
- [ ] Monitoring set up
- [ ] Backup strategy in place

## 📞 Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Review Vercel deployment logs**
3. **Check Supabase logs** for database issues
4. **Test locally** to isolate the problem
5. **Contact support** with specific error messages

Your TIA Schedule Builder is now ready for production use! 🎉
