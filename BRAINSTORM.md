# Feedback Guru - Product Brainstorm & Feature Analysis

## 🎯 Project Vision

A lightweight, fast feedback collection tool similar to Intercom but focused exclusively on feedback/bug reporting. Users can embed a widget on their website with a simple JavaScript snippet, allowing visitors to submit feedback with screenshots and annotations. The dashboard provides a Kanban-style interface for managing feedback with status tracking.

---

## 🔍 Competitive Analysis

### Leading Feedback Collection Tools (2025)

#### 1. **Usersnap** ⭐ Best for Screenshot Annotation
**Key Features to Clone:**
- Custom feedback widgets with pre-built templates
- 5 annotation tools: highlight, comment, pen, arrow, hide
- Automatic browser metadata capture
- Screen recording capability
- Simple JavaScript snippet embedding

**Pricing:** Enterprise-focused, complex pricing

#### 2. **Marker.io** ⭐ Best for Developer Experience
**Key Features to Clone:**
- One-click bug reporting
- Automatic screenshot capture with annotations
- Advanced technical metadata (browser, OS, console logs, network requests)
- Integration-focused (Jira, Linear, GitHub, etc.)
- Clean, minimal UI

**Pricing:** Starts at $49/month

#### 3. **Userback** ⭐ Best for Video Feedback
**Key Features to Clone:**
- Video recordings + annotated screenshots
- Session replay capabilities
- Visual feedback directly on the website
- Rating/satisfaction surveys

#### 4. **Canny** ⭐ Best for Feature Request Management
**Key Features to Clone:**
- Public feedback boards with voting
- Roadmap visibility
- Changelog updates
- Status tracking (Planned, In Progress, Complete)
- User segmentation

**Pricing:** $400/month (Growth plan)

#### 5. **FeedbackPlus** ⭐ Open Source Alternative
**Key Features to Clone:**
- Lightweight JavaScript library
- Screenshot editing functionality
- Inspired by Google's "Report an issue" widget
- CDN + npm distribution

---

## 🏗️ Proposed Architecture

### Tech Stack (as requested)
- **Frontend:** Next.js 14+ (App Router)
- **UI Components:** shadcn/ui + Radix UI
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js or Clerk
- **File Storage:** AWS S3 or Cloudflare R2 (for screenshots)
- **Real-time:** Pusher or Socket.io (optional for live updates)
- **Widget:** Vanilla JS (small bundle size)

### Components

#### 1. **Embeddable Widget** (JavaScript SDK)
- Lightweight (~20-30KB gzipped)
- Zero dependencies
- Customizable trigger button
- Modal overlay for feedback form
- Screenshot capture + annotation tools
- Drag & drop or paste images

#### 2. **Dashboard** (Next.js App)
- Authentication & multi-workspace support
- Kanban board for feedback management
- Feedback detail view
- User management
- Settings & customization
- Analytics & reporting
- Widget code generator

#### 3. **API** (Next.js API Routes)
- RESTful or tRPC endpoints
- Webhook support
- Public API for integrations
- Rate limiting & spam protection

---

## ✨ Core Features Breakdown

### 📦 Phase 1: MVP (Weeks 1-4)

#### Widget Features
- ✅ Simple JavaScript snippet embedding
- ✅ Customizable trigger button (position, color, text)
- ✅ Feedback form with fields:
  - Name (optional)
  - Email (optional)
  - Category (Bug, Feature Request, Question, Other)
  - Priority (Low, Medium, High)
  - Description (rich text)
- ✅ Screenshot capture (entire page)
- ✅ Basic annotations (arrow, highlight, text)
- ✅ Auto-capture metadata:
  - URL
  - Browser & version
  - OS & version
  - Screen resolution
  - Timestamp
  - User agent

#### Dashboard Features
- ✅ Authentication (email/password)
- ✅ Workspace creation
- ✅ Project setup with unique API key
- ✅ Widget code generator
- ✅ Feedback inbox (table view)
- ✅ Feedback detail modal
- ✅ Basic Kanban board (columns: New, In Progress, Resolved, Closed)
- ✅ Status updates (drag & drop)
- ✅ Basic filtering (category, priority, status)

### 🚀 Phase 2: Enhanced Features (Weeks 5-8)

#### Widget Enhancements
- ✅ Advanced annotations (pen/draw, blur/hide sensitive data)
- ✅ Multiple screenshot support
- ✅ Screen recording (optional, 30-60 seconds)
- ✅ Console log capture (last 50 entries)
- ✅ Network request capture (failed requests)
- ✅ Custom fields (configured from dashboard)
- ✅ Multi-language support
- ✅ GDPR-compliant data collection

#### Dashboard Enhancements
- ✅ Advanced search & filtering
- ✅ Bulk actions (status update, assign, delete)
- ✅ Team member invitations & roles
- ✅ Assignment system
- ✅ Comments & internal notes
- ✅ Email notifications
- ✅ Keyboard shortcuts
- ✅ Export to CSV/PDF

### 🔥 Phase 3: Advanced Features (Weeks 9-12)

#### Power Features
- ✅ Public feedback board (like Canny)
- ✅ Voting system for feature requests
- ✅ Roadmap page (public/private)
- ✅ Changelog page
- ✅ Integrations:
  - Slack notifications
  - Discord webhooks
  - Jira sync
  - Linear sync
  - GitHub Issues
  - Zapier webhook
- ✅ Custom webhooks
- ✅ SSO (SAML, OAuth)
- ✅ API for external access
- ✅ White-labeling options

#### Analytics
- ✅ Feedback trends over time
- ✅ Category/priority breakdown
- ✅ Average resolution time
- ✅ User engagement metrics
- ✅ Widget performance monitoring

---

## 🎨 Widget UX/UI Concept

### Trigger Button
```javascript
// Default position: bottom-right
// Customizable: position, color, icon, text
// Subtle pulse animation to attract attention
```

**States:**
- Default: Floating button with "Feedback" text + icon
- Hover: Slight scale up + tooltip
- Active: Opens modal overlay

### Feedback Modal
**Layout:**
- Left panel (60%): Form
  - Header: "Send us your feedback"
  - Category selector (icons)
  - Priority selector
  - Description textarea (auto-resize)
  - Email input (optional, remembered)
  - Custom fields (if configured)

- Right panel (40%): Screenshot
  - "Take screenshot" button
  - Preview with annotation tools
  - Option to upload/paste additional images

- Footer:
  - "Powered by Feedback Guru" (removable on paid plans)
  - "Cancel" + "Send Feedback" buttons

**Annotation Tools:**
- Arrow pointer
- Rectangle highlight
- Text label
- Pen/draw
- Blur/hide sensitive data
- Undo/redo
- Clear all

### Animation & Performance
- Modal slides in from bottom
- Screenshot capture with flash effect
- Submission with success animation
- Total interaction time: <30 seconds
- Widget loads asynchronously (no page blocking)

---

## 🗄️ Database Schema (Prisma)

```prisma
// Core Models

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  password      String
  workspaces    WorkspaceMember[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Workspace {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  members       WorkspaceMember[]
  projects      Project[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model WorkspaceMember {
  id            String      @id @default(cuid())
  workspace     Workspace   @relation(fields: [workspaceId], references: [id])
  workspaceId   String
  user          User        @relation(fields: [userId], references: [id])
  userId        String
  role          Role        @default(MEMBER)
  createdAt     DateTime    @default(now())

  @@unique([workspaceId, userId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Project {
  id            String      @id @default(cuid())
  name          String
  slug          String
  apiKey        String      @unique @default(uuid())
  workspace     Workspace   @relation(fields: [workspaceId], references: [id])
  workspaceId   String
  settings      Json?       // Widget customization
  feedback      Feedback[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([workspaceId, slug])
}

model Feedback {
  id            String      @id @default(cuid())
  project       Project     @relation(fields: [projectId], references: [id])
  projectId     String

  // Submitter info
  email         String?
  name          String?

  // Feedback content
  category      Category    @default(BUG)
  priority      Priority    @default(MEDIUM)
  title         String
  description   String      @db.Text
  status        Status      @default(NEW)

  // Metadata
  url           String
  browser       String?
  os            String?
  screenWidth   Int?
  screenHeight  Int?
  userAgent     String?
  consoleLogs   Json?
  networkLogs   Json?

  // Attachments
  screenshots   Screenshot[]

  // Management
  assignedTo    String?
  comments      Comment[]
  votes         Int         @default(0)

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([projectId, status])
  @@index([projectId, category])
  @@index([createdAt])
}

enum Category {
  BUG
  FEATURE_REQUEST
  QUESTION
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Status {
  NEW
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  WONT_FIX
}

model Screenshot {
  id            String      @id @default(cuid())
  feedback      Feedback    @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  feedbackId    String
  url           String      // S3/R2 URL
  annotations   Json?       // Annotation data
  createdAt     DateTime    @default(now())
}

model Comment {
  id            String      @id @default(cuid())
  feedback      Feedback    @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  feedbackId    String
  userId        String
  content       String      @db.Text
  isInternal    Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

---

## 🚢 Deployment & Scaling Considerations

### Infrastructure
- **Hosting:** Vercel (Next.js optimized) or Railway
- **Database:** Supabase (PostgreSQL) or Railway
- **CDN:** Cloudflare (widget distribution)
- **Storage:** Cloudflare R2 (cheaper than S3)
- **Monitoring:** Sentry (error tracking)

### Performance Targets
- Widget load time: <100ms
- Feedback submission: <500ms
- Dashboard load: <1s
- Screenshot upload: <2s

### Security
- API key authentication for widget
- Rate limiting (per IP, per project)
- XSS protection for user content
- CORS configuration
- Encrypted data at rest
- GDPR compliance (data export, deletion)

---

## 💰 Monetization Strategy

### Pricing Tiers

**Free Tier**
- 1 project
- 100 feedback/month
- Basic widget customization
- Community support
- "Powered by Feedback Guru" branding

**Starter - $29/month**
- 3 projects
- 1,000 feedback/month
- Remove branding
- Email support
- Custom fields

**Pro - $79/month**
- 10 projects
- 10,000 feedback/month
- Team members (up to 5)
- Integrations (Slack, Discord)
- Priority support

**Enterprise - Custom**
- Unlimited projects
- Unlimited feedback
- Unlimited team members
- SSO
- White-label
- Custom integrations
- Dedicated support

---

## 🎯 Unique Selling Points (USP)

1. **Blazing Fast** - Widget loads in <100ms, submissions in <500ms
2. **Beautiful UI** - Modern, clean interface built with shadcn/ui
3. **Developer-Friendly** - One-line integration, comprehensive API
4. **Privacy-First** - GDPR compliant, optional anonymous feedback
5. **Affordable** - Start free, scale affordably
6. **Open-Core Option** - Consider open-sourcing widget code

---

## 📊 Success Metrics

### Product Metrics
- Widget installation rate
- Feedback submission rate
- Time to first feedback
- Dashboard daily active users
- Feature adoption rate

### Business Metrics
- Free to paid conversion rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)
- Churn rate
- Net Promoter Score (NPS)

---

## 🎬 Getting Started

### Recommended Development Order

1. **Setup** (Day 1-2)
   - Initialize Next.js project
   - Setup shadcn/ui
   - Configure Prisma + PostgreSQL
   - Setup authentication

2. **Widget Skeleton** (Day 3-5)
   - Create vanilla JS widget
   - Implement trigger button
   - Build feedback modal
   - Test embedding

3. **Screenshot Capture** (Day 6-7)
   - Implement html2canvas or similar
   - Add basic annotations
   - Test on various websites

4. **API Development** (Day 8-10)
   - Build feedback submission endpoint
   - Implement file upload
   - Add validation & rate limiting

5. **Dashboard MVP** (Day 11-20)
   - Build authentication flow
   - Create workspace/project setup
   - Build feedback inbox
   - Implement Kanban board
   - Add status management

6. **Polish & Testing** (Day 21-28)
   - Cross-browser testing
   - Mobile responsiveness
   - Performance optimization
   - Security audit
   - Documentation

---

## 🔗 Inspiration & Resources

### Tools to Study
- **Marker.io** - Best-in-class developer experience
- **Canny** - Excellent feature request management
- **Usersnap** - Advanced screenshot annotation
- **FeedbackPlus** - Open source widget implementation
- **Linear** - Beautiful, fast UI/UX
- **Plane** - Open source project management

### Technical Resources
- html2canvas - Screenshot capture
- Fabric.js or Konva.js - Canvas annotation
- Radix UI - Accessible components
- TipTap - Rich text editor
- Zod - Schema validation
- tRPC - Type-safe API (optional)

---

## 🤝 Competitive Advantages

| Feature | Feedback Guru | Marker.io | Usersnap | Canny |
|---------|--------------|-----------|----------|-------|
| Price (Starter) | $29/mo | $49/mo | $69/mo | $400/mo |
| Screenshot Annotations | ✅ | ✅ | ✅ | ❌ |
| Kanban Board | ✅ | ❌ | ✅ | ✅ |
| Public Feedback Board | ✅ (Phase 3) | ❌ | ❌ | ✅ |
| Open Widget Code | ✅ | ❌ | ❌ | ❌ |
| Modern Stack | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Self-Hosting Option | 🎯 Future | ❌ | ❌ | ❌ |

---

## 🎨 Design Philosophy

1. **Speed is a Feature** - Every interaction should feel instant
2. **Simplicity First** - If a feature adds complexity, it needs strong justification
3. **Beautiful by Default** - No "enterprise ugly" - modern, clean, delightful
4. **Developer Experience** - One line to integrate, comprehensive docs
5. **Privacy Conscious** - Give users control over their data

---

## 📝 Notes & Considerations

### Technical Challenges
1. **Screenshot Quality vs File Size** - Balance needed
2. **Cross-Origin Issues** - Widget needs to work on any domain
3. **Ad Blockers** - May block widget, need fallback
4. **Mobile Support** - Touch annotations, responsive modal
5. **Spam Prevention** - Rate limiting, captcha for anonymous feedback

### Feature Considerations
1. Should feedback be public by default? (Canny model)
2. Allow anonymous feedback submissions?
3. Email verification for submitters?
4. AI-powered categorization/duplicate detection?
5. Translation of feedback in dashboard?

### Future Possibilities
1. Chrome extension for easier testing
2. Mobile SDK (React Native, Flutter)
3. AI-powered insights & categorization
4. Sentiment analysis
5. Video session replay (like LogRocket)
6. A/B testing integration
7. NPS surveys
8. Customer satisfaction (CSAT) scores

---

**Last Updated:** November 2025
**Status:** Pre-Development / Planning Phase
