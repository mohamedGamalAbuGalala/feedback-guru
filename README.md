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

- **[📋 BRAINSTORM.md](./BRAINSTORM.md)** - Complete product vision, feature analysis, and competitor research
- **[🗺️ IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Week-by-week development guide with code examples
- **[📊 COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)** - Detailed comparison with Marker.io, Canny, Usersnap, etc.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm/pnpm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/feedback-guru.git
cd feedback-guru

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

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

### ✅ Phase 1: MVP (Weeks 1-4)
- [x] Widget with screenshot capture
- [x] Basic annotations (arrow, highlight, text)
- [x] Feedback submission API
- [x] Dashboard with kanban board
- [x] Table view with filtering

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
