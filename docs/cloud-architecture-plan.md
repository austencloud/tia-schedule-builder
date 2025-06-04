# TIA Schedule Builder - Cloud Architecture Plan

## 🎯 Goal: Transform to Multi-Device Museum Staffing System

### Current State → Target State
- **From**: Local-only Svelte app with static data
- **To**: Cloud-synchronized, multi-device museum management system

## 🏗️ Recommended Architecture

### **Option 1: Supabase + Vercel (RECOMMENDED)**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Desktop Web   │    │   Tablet Web    │    │   Mobile Web    │
│    Browser      │    │    Browser      │    │    Browser      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Vercel Hosting       │
                    │   (Svelte App Deployed)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │       Supabase Cloud      │
                    │  ┌─────────────────────┐  │
                    │  │   PostgreSQL DB     │  │
                    │  │   (Schedule Data)   │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   Real-time Sync    │  │
                    │  │   (Live Updates)    │  │
                    │  └─────────────────────┘  │
                    │  ┌─────────────────────┐  │
                    │  │   File Storage      │  │
                    │  │   (PDF Reports)     │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
```

### **Why Supabase + Vercel?**

#### ✅ **Advantages**
- **Zero Server Management**: Fully managed services
- **Real-Time Sync**: Built-in WebSocket connections
- **Offline Support**: Automatic caching and sync when reconnected
- **Free Tier**: Covers typical museum usage (up to 50,000 monthly active users)
- **Simple Setup**: 15-minute initial setup
- **Automatic Backups**: Built-in database backups
- **Professional Reports**: Easy PDF generation and sharing
- **Security**: Built-in authentication and row-level security

#### 💰 **Cost Analysis**
- **Supabase Free Tier**: 50,000 monthly active users, 500MB database
- **Vercel Free Tier**: 100GB bandwidth, unlimited deployments
- **Total Monthly Cost**: $0 for typical museum usage
- **Paid Upgrade**: Only if >50k users or >500MB data (~$25/month)

## 📊 Alternative Options Comparison

| Solution | Setup Time | Maintenance | Cost/Month | Real-Time | Offline |
|----------|------------|-------------|------------|-----------|---------|
| **Supabase + Vercel** | 15 min | None | $0-25 | ✅ Yes | ✅ Yes |
| Firebase + Vercel | 30 min | None | $0-30 | ✅ Yes | ✅ Yes |
| GitHub Pages + JSON | 5 min | Manual | $0 | ❌ No | ❌ No |
| Custom Server | 2+ hours | High | $10-50 | ⚠️ Complex | ⚠️ Complex |

## 🚀 Implementation Roadmap

### **Phase 1: Database Setup (Day 1)**
1. Create Supabase project
2. Design database schema for schedules
3. Set up real-time subscriptions
4. Configure row-level security

### **Phase 2: App Integration (Day 2-3)**
1. Install Supabase client in Svelte app
2. Replace local data with database calls
3. Implement real-time sync
4. Add offline support with local caching

### **Phase 3: Report Generation (Day 4)**
1. Create PDF report templates
2. Implement server-side report generation
3. Add email sharing functionality
4. Create shareable report links

### **Phase 4: Deployment (Day 5)**
1. Deploy to Vercel with automatic CI/CD
2. Configure custom domain (optional)
3. Set up monitoring and error tracking
4. User testing and feedback

## 🗄️ Database Schema Design

### **schedules table**
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### **schedule_days table** (normalized approach)
```sql
CREATE TABLE schedule_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id),
  day_number INTEGER NOT NULL,
  day_name VARCHAR(20) NOT NULL,
  total_hours DECIMAL(4,2) DEFAULT 0,
  staff JSONB DEFAULT '[]',
  events JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **reports table**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id),
  report_type VARCHAR(50) NOT NULL,
  file_url TEXT,
  share_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

## 🔄 Real-Time Sync Strategy

### **Data Flow**
1. **User Action**: Edit schedule on any device
2. **Local Update**: Immediate UI update for responsiveness
3. **Cloud Sync**: Send changes to Supabase
4. **Real-Time Broadcast**: Supabase notifies all connected devices
5. **Remote Update**: Other devices receive and apply changes

### **Conflict Resolution**
- **Last Write Wins**: Simple approach for museum scheduling
- **Optimistic Updates**: UI updates immediately, reverts if conflict
- **User Notification**: Alert if changes conflict with recent updates

## 📱 Multi-Device Experience

### **Responsive Design**
- **Desktop**: Full-featured interface with side panels
- **Tablet**: Optimized for touch with larger buttons
- **Mobile**: Bottom sheet modals and thumb-friendly navigation

### **Progressive Web App (PWA)**
- **Install Prompt**: "Add to Home Screen" for app-like experience
- **Offline Capability**: Works without internet, syncs when reconnected
- **Push Notifications**: Optional alerts for schedule changes

## 🔐 Security & Privacy

### **Authentication Options**
1. **Magic Link**: Email-based login (no passwords)
2. **Google OAuth**: Sign in with Google account
3. **Simple PIN**: 4-digit PIN for quick access

### **Data Security**
- **Row-Level Security**: Users only see their museum's data
- **HTTPS Everywhere**: All connections encrypted
- **Regular Backups**: Automatic daily backups
- **GDPR Compliant**: Data export and deletion capabilities

## 📊 Monitoring & Analytics

### **Error Tracking**
- **Sentry Integration**: Automatic error reporting
- **User Feedback**: Simple feedback form for issues
- **Performance Monitoring**: Track load times and responsiveness

### **Usage Analytics**
- **Privacy-First**: No personal data tracking
- **Feature Usage**: Understand which features are most used
- **Performance Metrics**: Monitor app speed and reliability

## 🎯 Success Metrics

### **Technical Metrics**
- **Uptime**: >99.9% availability
- **Sync Speed**: <2 seconds for updates across devices
- **Load Time**: <3 seconds initial load
- **Offline Support**: Works for 24+ hours without connection

### **User Experience Metrics**
- **Ease of Use**: Non-technical users can use without training
- **Reliability**: Zero data loss incidents
- **Cross-Device**: Seamless experience across all devices
- **Report Quality**: Professional-looking PDF reports
