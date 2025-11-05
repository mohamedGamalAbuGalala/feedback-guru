# Feedback Guru - Technical Implementation Roadmap

## 🏗️ Project Structure

```
feedback-guru/
├── apps/
│   ├── web/                    # Next.js Dashboard
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── [workspace]/
│   │   │   │   │   ├── [project]/
│   │   │   │   │   │   ├── feedback/
│   │   │   │   │   │   ├── board/
│   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── analytics/
│   │   │   │   │   └── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── feedback/
│   │   │   │   ├── projects/
│   │   │   │   ├── upload/
│   │   │   │   └── webhook/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn components
│   │   │   ├── feedback/       # Feedback-specific components
│   │   │   ├── kanban/         # Kanban board components
│   │   │   └── layouts/        # Layout components
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── widget/                 # Vanilla JS Widget
│       ├── src/
│       │   ├── index.ts
│       │   ├── ui/
│       │   │   ├── modal.ts
│       │   │   ├── button.ts
│       │   │   └── annotator.ts
│       │   ├── capture/
│       │   │   ├── screenshot.ts
│       │   │   └── metadata.ts
│       │   └── api/
│       │       └── client.ts
│       ├── rollup.config.js
│       └── package.json
│
├── packages/
│   ├── database/              # Shared Prisma schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── types/                 # Shared TypeScript types
│   │   └── index.ts
│   │
│   └── config/                # Shared configs
│       ├── eslint/
│       └── typescript/
│
├── .env.example
├── docker-compose.yml
├── package.json
└── turbo.json                 # Turborepo config (optional)
```

---

## 📋 Phase 1: MVP Development (4 weeks)

### Week 1: Foundation & Setup

#### Day 1-2: Project Initialization
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir

# Initialize widget project
mkdir -p apps/widget
cd apps/widget
npm init -y

# Setup Prisma
npm install prisma @prisma/client
npx prisma init
```

**Tasks:**
- [ ] Setup monorepo structure (pnpm workspaces or Turborepo)
- [ ] Configure TypeScript for all packages
- [ ] Setup ESLint & Prettier
- [ ] Initialize Git & setup .gitignore
- [ ] Create environment variables template

#### Day 3-4: Database & Authentication
```prisma
// Implement schema from BRAINSTORM.md
// Focus on: User, Workspace, Project, Feedback, Screenshot models
```

**Tasks:**
- [ ] Create Prisma schema
- [ ] Setup PostgreSQL (local Docker or Supabase)
- [ ] Run initial migration
- [ ] Seed database with test data
- [ ] Setup NextAuth.js or Clerk
- [ ] Implement login/register pages

#### Day 5-7: shadcn/ui Setup & Base Layout
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input form card dialog
```

**Tasks:**
- [ ] Install & configure shadcn/ui
- [ ] Create dashboard layout with sidebar
- [ ] Implement navigation
- [ ] Setup protected routes
- [ ] Create workspace selector
- [ ] Build project creation flow

---

### Week 2: Widget Development

#### Day 8-9: Widget Core
**File:** `apps/widget/src/index.ts`

```typescript
// Widget initialization
interface FeedbackGuruConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonText?: string;
}

class FeedbackGuru {
  private config: FeedbackGuruConfig;
  private button: HTMLElement | null = null;
  private modal: HTMLElement | null = null;

  constructor(config: FeedbackGuruConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    // Inject styles
    this.injectStyles();
    // Create trigger button
    this.createButton();
    // Listen for events
    this.attachEventListeners();
  }

  // ... implementation
}

// Global initialization
(window as any).FeedbackGuru = FeedbackGuru;
```

**Tasks:**
- [ ] Create widget entry point
- [ ] Implement trigger button
- [ ] Design button styles (CSS-in-JS or inline)
- [ ] Add button positioning logic
- [ ] Implement button animations

#### Day 10-11: Feedback Modal
**File:** `apps/widget/src/ui/modal.ts`

```typescript
export class FeedbackModal {
  private container: HTMLElement;

  constructor() {
    this.container = this.createModal();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fg-modal-overlay';
    modal.innerHTML = `
      <div class="fg-modal">
        <div class="fg-modal-header">
          <h2>Send us your feedback</h2>
          <button class="fg-close">×</button>
        </div>
        <div class="fg-modal-body">
          <form id="fg-form">
            <!-- Category selection -->
            <!-- Priority selection -->
            <!-- Description textarea -->
            <!-- Email input -->
            <!-- Screenshot preview -->
          </form>
        </div>
        <div class="fg-modal-footer">
          <button type="button" class="fg-btn-secondary">Cancel</button>
          <button type="submit" class="fg-btn-primary">Send Feedback</button>
        </div>
      </div>
    `;
    return modal;
  }

  // ... modal methods
}
```

**Tasks:**
- [ ] Create modal HTML structure
- [ ] Style modal (responsive)
- [ ] Implement form fields
- [ ] Add form validation
- [ ] Handle form submission
- [ ] Show success/error states

#### Day 12-14: Screenshot Capture & Annotations
**File:** `apps/widget/src/capture/screenshot.ts`

```typescript
import html2canvas from 'html2canvas';

export async function captureScreenshot(): Promise<string> {
  const canvas = await html2canvas(document.body, {
    allowTaint: true,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

// Annotation implementation using Canvas API
export class AnnotationEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tools = ['arrow', 'highlight', 'text'];

  // ... annotation methods
}
```

**Tasks:**
- [ ] Implement html2canvas integration
- [ ] Create annotation canvas overlay
- [ ] Implement arrow tool
- [ ] Implement highlight tool
- [ ] Implement text tool
- [ ] Add undo/redo functionality
- [ ] Optimize screenshot size

---

### Week 3: API & Dashboard Core

#### Day 15-16: Feedback Submission API
**File:** `apps/web/app/api/feedback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  apiKey: z.string(),
  category: z.enum(['BUG', 'FEATURE_REQUEST', 'QUESTION', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  description: z.string().min(10),
  email: z.string().email().optional(),
  name: z.string().optional(),
  url: z.string().url(),
  browser: z.string().optional(),
  os: z.string().optional(),
  screenshot: z.string().optional(), // base64
  metadata: z.object({}).passthrough(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    // Verify API key
    const project = await prisma.project.findUnique({
      where: { apiKey: data.apiKey }
    });

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Upload screenshot if provided
    let screenshotUrl = null;
    if (data.screenshot) {
      screenshotUrl = await uploadToStorage(data.screenshot);
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        projectId: project.id,
        category: data.category,
        priority: data.priority,
        title: generateTitle(data.description), // Auto-generate from description
        description: data.description,
        email: data.email,
        name: data.name,
        url: data.url,
        browser: data.browser,
        os: data.os,
        status: 'NEW',
        screenshots: screenshotUrl ? {
          create: { url: screenshotUrl }
        } : undefined,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
```

**Tasks:**
- [ ] Create feedback submission endpoint
- [ ] Implement API key validation
- [ ] Add request validation (Zod)
- [ ] Implement rate limiting
- [ ] Setup file upload (S3/R2)
- [ ] Add error handling
- [ ] Test with widget

#### Day 17-18: File Upload & Storage
**File:** `apps/web/lib/storage.ts`

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadScreenshot(
  base64Data: string,
  feedbackId: string
): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');

  const key = `screenshots/${feedbackId}/${Date.now()}.png`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  }));

  return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}
```

**Tasks:**
- [ ] Setup AWS S3 or Cloudflare R2
- [ ] Implement upload function
- [ ] Add image optimization
- [ ] Implement presigned URLs (for downloads)
- [ ] Add cleanup cron job (delete old screenshots)

#### Day 19-21: Dashboard - Feedback Inbox
**File:** `apps/web/app/(dashboard)/[workspace]/[project]/feedback/page.tsx`

```typescript
import { DataTable } from '@/components/feedback/data-table';
import { columns } from '@/components/feedback/columns';

export default async function FeedbackPage({
  params,
}: {
  params: { workspace: string; project: string };
}) {
  const feedback = await prisma.feedback.findMany({
    where: {
      project: {
        workspace: { slug: params.workspace },
        slug: params.project,
      },
    },
    include: {
      screenshots: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback</h1>
        <div className="flex gap-2">
          {/* Filters */}
        </div>
      </div>
      <DataTable columns={columns} data={feedback} />
    </div>
  );
}
```

**Tasks:**
- [ ] Create feedback list page
- [ ] Implement data table (Tanstack Table)
- [ ] Add sorting & filtering
- [ ] Create feedback detail modal
- [ ] Show screenshots in lightbox
- [ ] Add status update dropdown
- [ ] Implement pagination

---

### Week 4: Kanban Board & Polish

#### Day 22-24: Kanban Board Implementation
**File:** `apps/web/app/(dashboard)/[workspace]/[project]/board/page.tsx`

```typescript
'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Column } from '@/components/kanban/column';
import { FeedbackCard } from '@/components/kanban/feedback-card';

export default function BoardPage() {
  const [columns, setColumns] = useState([
    { id: 'NEW', title: 'New', items: [] },
    { id: 'IN_PROGRESS', title: 'In Progress', items: [] },
    { id: 'RESOLVED', title: 'Resolved', items: [] },
    { id: 'CLOSED', title: 'Closed', items: [] },
  ]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Update status in database
    await updateFeedbackStatus(active.id, over.id);

    // Update local state
    // ...
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto">
        {columns.map((column) => (
          <Column key={column.id} column={column}>
            {column.items.map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}
```

**Dependencies:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Tasks:**
- [ ] Install @dnd-kit
- [ ] Create kanban board layout
- [ ] Implement column components
- [ ] Create feedback card components
- [ ] Add drag & drop functionality
- [ ] Update status via API
- [ ] Add optimistic updates
- [ ] Implement card detail view

#### Day 25-26: Widget Code Generator
**File:** `apps/web/app/(dashboard)/[workspace]/[project]/settings/page.tsx`

```typescript
export default function SettingsPage({ params }) {
  const project = await getProject(params.project);

  const widgetCode = `
<script>
  (function(w,d,s,o,f,js,fjs){
    w['FeedbackGuru']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'fg', 'https://cdn.feedbackguru.com/widget.js'));
  fg('init', { apiKey: '${project.apiKey}' });
</script>
  `.trim();

  return (
    <div>
      <h2>Installation</h2>
      <CodeBlock code={widgetCode} />
      <h2>Widget Customization</h2>
      {/* Color picker, position selector, etc. */}
    </div>
  );
}
```

**Tasks:**
- [ ] Create settings page
- [ ] Generate widget code snippet
- [ ] Add copy-to-clipboard functionality
- [ ] Implement widget customization options
- [ ] Add live preview iframe
- [ ] Save customization settings

#### Day 27-28: Testing & Bug Fixes
**Tasks:**
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Widget embedding test on multiple sites
- [ ] API endpoint testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Fix critical bugs
- [ ] Write basic documentation

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example: apps/web/__tests__/api/feedback.test.ts
import { POST } from '@/app/api/feedback/route';

describe('POST /api/feedback', () => {
  it('should create feedback with valid data', async () => {
    // Test implementation
  });

  it('should reject invalid API key', async () => {
    // Test implementation
  });
});
```

**Tools:**
- Jest or Vitest
- React Testing Library
- Playwright (E2E)

### Widget Testing
```typescript
// apps/widget/__tests__/screenshot.test.ts
import { captureScreenshot } from '@/capture/screenshot';

describe('Screenshot capture', () => {
  it('should capture full page screenshot', async () => {
    // Test implementation
  });
});
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] S3/R2 bucket created & configured
- [ ] CDN setup for widget
- [ ] Domain configured
- [ ] SSL certificates installed

### Vercel Deployment (Dashboard)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

**Environment Variables:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`

### CDN Deployment (Widget)
```bash
# Build widget
cd apps/widget
npm run build

# Upload to CDN (Cloudflare, AWS CloudFront, etc.)
# Output: dist/feedback-guru.min.js
```

---

## 📚 Documentation Requirements

### For Developers
- [ ] Installation guide
- [ ] API documentation
- [ ] Widget customization options
- [ ] Webhook documentation
- [ ] Rate limiting details

### For Users
- [ ] Getting started guide
- [ ] Dashboard walkthrough
- [ ] Best practices
- [ ] Troubleshooting guide
- [ ] FAQ

---

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
```

---

## 🎯 Success Criteria for MVP

### Functionality
- ✅ Widget embeds on any website
- ✅ Users can submit feedback with screenshots
- ✅ Dashboard shows all feedback
- ✅ Kanban board works with drag & drop
- ✅ Status updates persist
- ✅ Screenshots are viewable

### Performance
- ✅ Widget loads in <100ms
- ✅ Feedback submits in <500ms
- ✅ Dashboard loads in <1s

### Quality
- ✅ No console errors
- ✅ Works on Chrome, Firefox, Safari
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.1 AA)

---

## 📈 Post-MVP Iterations

### Version 1.1 (Weeks 5-6)
- Email notifications
- Team member invitations
- Advanced filtering & search
- Bulk actions

### Version 1.2 (Weeks 7-8)
- Screen recording
- Console log capture
- Custom fields
- API documentation & endpoints

### Version 1.3 (Weeks 9-10)
- Public feedback board
- Voting system
- Integrations (Slack, Discord)
- Analytics dashboard

### Version 2.0 (Weeks 11-12)
- Roadmap page
- Changelog
- White-labeling
- SSO

---

**Next Step:** Start with Week 1, Day 1 - Project Initialization! 🚀
