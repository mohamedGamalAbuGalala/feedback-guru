# Feedback Guru 🎯

> A modern, lightning-fast feedback collection tool with screenshot annotations and kanban management. Like Intercom, but focused exclusively on feedback.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## ✨ Features

### 🎨 Embeddable Widget
- **One-line integration** - Copy/paste a JavaScript snippet
- **Lightning fast** - <100ms load time, ~30KB bundle
- **Screenshot capture** - With 5 annotation tools (arrow, highlight, text, pen, hide)
- **Auto-metadata** - Browser, OS, screen size, URL, timestamp
- **Customizable** - Colors, position, text, branding

### 📊 Beautiful Dashboard
- **Kanban board** - Drag & drop feedback between status columns
- **Table view** - Sort, filter, and search all feedback
- **Team collaboration** - Comments, assignments, status updates
- **Multi-workspace** - Manage multiple projects/clients
- **Real-time updates** - See changes as they happen

### 🚀 Developer Experience
- **Modern stack** - Next.js 14, Prisma, shadcn/ui
- **Type-safe** - End-to-end TypeScript
- **API access** - RESTful API for integrations
- **Webhooks** - Get notified of new feedback
- **Documentation** - Comprehensive guides & examples

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + React
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Storage:** AWS S3 / Cloudflare R2
- **Deployment:** Vercel (dashboard) + CDN (widget)

## 📚 Documentation

- **[🚀 GETTING_STARTED.md](./GETTING_STARTED.md)** - **START HERE!** Complete setup guide with troubleshooting
- **[📋 BRAINSTORM.md](./BRAINSTORM.md)** - Complete product vision, feature analysis, and competitor research
- **[🗺️ IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Week-by-week development guide with code examples
- **[📊 COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)** - Detailed comparison with Marker.io, Canny, Usersnap, etc.
- **[✅ SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Verification guide for completed setup

## 🎯 Quick Start

**👉 Full setup guide:** See **[GETTING_STARTED.md](./GETTING_STARTED.md)** for detailed instructions.

### Option 1: Docker (Recommended - 2 minutes) 🐳

Everything runs in Docker with hot reloading:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/feedback-guru.git
cd feedback-guru

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start everything with Docker
docker compose up

# That's it! Docker handles:
# - PostgreSQL database
# - Next.js web app (with hot reload)
# - Widget build (with watch mode)
# - All dependencies
```

**Then visit:**
- 📊 Dashboard: **http://localhost:3000**
- 🗄️ pgAdmin: **http://localhost:5050** (admin@feedbackguru.local / admin)

### Option 2: Local Development (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/feedback-guru.git
cd feedback-guru
npm install

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Setup database
cd packages/database
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# 4. Copy environment variables
cp .env.example .env.local

# 5. Start dashboard
npm run dev

# 6. In another terminal, start widget
cd apps/widget
npm run watch
```

**Then:**
- 📊 Dashboard: **http://localhost:3000**
- 📝 Create account → Create project → Copy widget code → Test it!

## 🎨 Widget Usage

Add this snippet to your website:

```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['FeedbackGuru']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'fg', 'https://cdn.feedbackguru.com/widget.js'));
  fg('init', { apiKey: 'YOUR_API_KEY' });
</script>
```

### Customization

```javascript
fg('init', {
  apiKey: 'YOUR_API_KEY',
  position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
  primaryColor: '#6366f1',
  buttonText: 'Feedback',
  language: 'en',
});
```

## 🏗️ Infrastructure & Services

### Required Services

#### 1. PostgreSQL Database
- **Purpose:** Main application database
- **Docker:** Included in `docker-compose.yml`
- **Local:** Install PostgreSQL 15+ or use Docker
- **Production:** Any PostgreSQL hosting (AWS RDS, Supabase, Neon, Railway)

```bash
# Quick start with Docker
docker compose up -d postgres
```

### Optional Services (Recommended for Production)

#### 2. Email Service - Resend (for notifications)
- **Purpose:** Team invitations, feedback notifications, comments, status changes
- **Cost:** Free tier: 3,000 emails/month, then $20/month
- **Setup:**
  1. Sign up at [resend.com](https://resend.com)
  2. Get API key
  3. Add to `.env.local`:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxx
     EMAIL_FROM=notifications@your-domain.com
     ```
- **Alternative:** SendGrid, AWS SES, Mailgun, Postmark

#### 3. File Storage - AWS S3 or Cloudflare R2 (for screenshots)
- **Purpose:** Store feedback screenshots
- **Cost:**
  - AWS S3: ~$0.023/GB/month + $0.0004/1k requests
  - Cloudflare R2: Free up to 10GB, then $0.015/GB
- **Setup (AWS S3):**
  1. Create S3 bucket
  2. Create IAM user with S3 access
  3. Add to `.env.local`:
     ```
     AWS_ACCESS_KEY_ID=xxx
     AWS_SECRET_ACCESS_KEY=xxx
     AWS_REGION=us-east-1
     S3_BUCKET_NAME=feedback-guru-screenshots
     ```
- **Setup (Cloudflare R2):**
  1. Create R2 bucket
  2. Generate R2 API token
  3. Add to `.env.local`:
     ```
     R2_ACCOUNT_ID=xxx
     R2_ACCESS_KEY_ID=xxx
     R2_SECRET_ACCESS_KEY=xxx
     R2_BUCKET_NAME=feedback-guru-screenshots
     ```

### Integrations (Configured via Dashboard)

These are configured through the UI at `/dashboard/integrations`:

#### 4. Slack Integration
- **Purpose:** Get feedback notifications in Slack channels
- **Cost:** Free
- **Setup:**
  1. Create Slack incoming webhook
  2. Add webhook URL in dashboard integrations page
  3. Test connection
- **Docs:** [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

#### 5. Discord Integration
- **Purpose:** Post feedback to Discord channels
- **Cost:** Free
- **Setup:**
  1. Create Discord webhook (Server Settings → Integrations → Webhooks)
  2. Add webhook URL in dashboard integrations page
  3. Test connection
- **Docs:** [Discord Webhooks](https://support.discord.com/hc/en-us/articles/228383668)

#### 6. Custom Webhooks
- **Purpose:** Send feedback events to your own services
- **Cost:** Free
- **Setup:** Add your webhook URL in dashboard integrations page
- **Events:** feedback.created, feedback.updated, feedback.commented, feedback.status_changed
- **Security:** HMAC signature verification included

### Optional Services

#### 7. Vercel / Netlify (for deployment)
- **Purpose:** Host Next.js dashboard
- **Cost:** Free tier available, Pro from $20/month
- **Recommended:** Vercel (built by Next.js creators)

#### 8. CDN - Cloudflare or AWS CloudFront (for widget)
- **Purpose:** Distribute widget globally with low latency
- **Cost:**
  - Cloudflare: Free
  - AWS CloudFront: Pay as you go (~$0.085/GB)

#### 9. Error Tracking - Sentry
- **Purpose:** Monitor errors in production
- **Cost:** Free tier: 5k events/month
- **Setup:** Add `SENTRY_DSN` to `.env.local`

#### 10. Analytics - Google Analytics or Vercel Analytics
- **Purpose:** Track usage and user behavior
- **Cost:** Free (GA) or included with Vercel Pro
- **Setup:** Add tracking ID to `.env.local`

### Cost Estimate

**Minimal Setup (Development):**
- PostgreSQL: Free (Docker or local)
- **Total: $0/month**

**Production (Small Scale - up to 10k users):**
- PostgreSQL: $7/month (Railway/Supabase)
- Vercel Hobby: $0 (or Pro $20/month)
- Resend: $0 (free tier)
- Cloudflare R2: $0 (under 10GB)
- **Total: $7-27/month**

**Production (Medium Scale - up to 100k users):**
- PostgreSQL: $25/month (AWS RDS/Supabase)
- Vercel Pro: $20/month
- Resend: $20/month
- AWS S3: $5/month
- Cloudflare CDN: $0
- **Total: $70/month**

## 🗺️ Roadmap

### ✅ Phase 1: MVP - **COMPLETE!**
- [x] Widget with screenshot capture and annotations
- [x] Feedback submission API with validation
- [x] Dashboard with kanban board (drag & drop)
- [x] Table view with filtering & search
- [x] Projects management
- [x] Multi-workspace support
- [x] Authentication system (NextAuth)

### ✅ Phase 2: Advanced Debugging - **COMPLETE!**
- [x] Console log capture (automatic)
- [x] Network request logging (errors & slow requests)
- [x] Comments system for feedback
- [x] Feedback management API (CRUD)
- [x] Status updates & assignment
- [x] Beautiful log viewers in dashboard

### ✅ Phase 3: Marketing & Public Features - **COMPLETE!**
- [x] Landing page with beta pricing
- [x] Public feedback board
- [x] Voting system with IP tracking
- [x] Settings page for public board management

### ✅ Phase 4: Team Collaboration & Integrations - **COMPLETE!**
- [x] Team member invitation system
- [x] Role-based permissions (OWNER, ADMIN, MEMBER, VIEWER)
- [x] Slack integration
- [x] Discord integration
- [x] Custom webhook system with HMAC signatures

### ✅ Phase 5: Email & Roadmap - **COMPLETE!**
- [x] Email notification system (Resend)
- [x] Invitation emails
- [x] Feedback notification emails
- [x] Comment notification emails
- [x] Status change notification emails
- [x] Product roadmap management
- [x] Public roadmap page

### 🚀 Phase 6: Analytics & Polish (In Progress)
- [ ] Analytics dashboard (metrics, trends, charts)
- [ ] Changelog system
- [ ] Public changelog page
- [ ] Screen recording (future)
- [ ] Mobile app (future)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by the best features of:
- [Marker.io](https://marker.io) - Developer experience
- [Canny](https://canny.io) - Community features
- [Linear](https://linear.app) - Speed & UI/UX
- [Usersnap](https://usersnap.com) - Visual feedback
- [Intercom](https://intercom.com) - Widget familiarity

## 📞 Support

- **Documentation:** [docs.feedbackguru.com](https://docs.feedbackguru.com)
- **Email:** support@feedbackguru.com
- **Discord:** [Join our community](https://discord.gg/feedbackguru)
- **Twitter:** [@FeedbackGuru](https://twitter.com/feedbackguru)

---

Made with ❤️ by developers, for developers.
