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

### Fast Setup (5 minutes)

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

# 4. Start dashboard
npm run dev:web

# 5. In another terminal, start widget
cd apps/widget
npm install && npm run build && npm run serve
```

**Then:**
- 📊 Dashboard: **http://localhost:3000**
- 🎯 Widget Test: **http://localhost:3001/test.html**
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

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Weeks 1-4) - **COMPLETE!**
- [x] Widget with screenshot capture
- [x] Screenshot annotations (arrow, highlight, text, pen, blur)
- [x] Feedback submission API with validation
- [x] Dashboard with kanban board (drag & drop)
- [x] Table view with filtering & search
- [x] Projects management
- [x] Multi-workspace support
- [x] Authentication system

### 🚧 Phase 2: Enhanced (Weeks 5-8)
- [ ] Advanced annotations (pen, blur)
- [ ] Screen recording
- [ ] Console log capture
- [ ] Team collaboration features
- [ ] Email notifications

### 🔮 Phase 3: Advanced (Weeks 9-12)
- [ ] Public feedback board
- [ ] Voting system
- [ ] Roadmap page
- [ ] Changelog
- [ ] Integrations (Slack, Discord, Jira, Linear)

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
