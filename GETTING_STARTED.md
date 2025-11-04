# 🚀 Getting Started with Feedback Guru

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 14+ OR **Docker** (for running PostgreSQL in a container)

---

## ⚡ Quick Start (5 minutes)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/feedback-guru.git
cd feedback-guru
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start PostgreSQL

**Option A: Using Docker (Recommended)**
```bash
docker compose up -d postgres
```

**Option B: Using Local PostgreSQL**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a database:
```sql
CREATE DATABASE feedbackguru;
CREATE USER feedbackguru WITH PASSWORD 'feedbackguru_dev_password';
GRANT ALL PRIVILEGES ON DATABASE feedbackguru TO feedbackguru;
```

### Step 4: Setup Database
```bash
cd packages/database
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### Step 5: Start Development Servers

**Terminal 1 - Dashboard:**
```bash
npm run dev:web
```
Dashboard will be available at: **http://localhost:3000**

**Terminal 2 - Widget:**
```bash
cd apps/widget
npm install
npm run build
npm run serve
```
Widget will be available at: **http://localhost:3001**

### Step 6: Create Your Account
1. Go to **http://localhost:3000/register**
2. Create an account
3. Login and you'll see the dashboard!

---

## 🎯 Your First Project

### 1. Create a Project
1. Navigate to **Projects** in the sidebar
2. Click **"New Project"**
3. Enter project name (e.g., "My Website")
4. Click **"Create Project"**

### 2. Get Your Widget Code
1. Click on your newly created project
2. Copy the **Installation Code** snippet
3. You'll see something like:
```html
<script>
  (function(w,d,s,o,f,js,fjs){
    w['FeedbackGuru']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'fg', 'http://localhost:3001/widget.js'));
  fg('init', { apiKey: 'YOUR_API_KEY' });
</script>
```

### 3. Test the Widget
**Option A: Use the Test Page**
1. Open **http://localhost:3001/test.html**
2. Click the "Feedback" button in the bottom-right
3. Fill out the form and submit!

**Option B: Add to Your Website**
1. Paste the widget code before the closing `</body>` tag of your website
2. Reload your page
3. You should see the feedback button!

### 4. View Feedback
1. Go to **Feedback** page in the dashboard
2. See all submitted feedback with filters
3. Click on any feedback to see details and screenshots

### 5. Organize with Kanban
1. Go to **Kanban Board** page
2. Drag and drop feedback between columns:
   - **New** → **Open** → **In Progress** → **Resolved** → **Closed**

---

## 📁 Project Structure

```
feedback-guru/
├── apps/
│   ├── web/                    # Next.js Dashboard
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities
│   │   └── package.json
│   │
│   └── widget/                 # Vanilla JS Widget
│       ├── src/
│       │   ├── ui/            # UI components
│       │   ├── capture/       # Screenshot & metadata
│       │   └── api/           # API client
│       └── package.json
│
├── packages/
│   └── database/               # Prisma Schema
│       └── prisma/
│           └── schema.prisma
│
├── BRAINSTORM.md              # Product vision
├── IMPLEMENTATION_ROADMAP.md  # Development guide
├── COMPETITIVE_ANALYSIS.md    # Market research
└── SETUP_COMPLETE.md          # Setup verification
```

---

## 🛠️ Development Workflow

### Adding New Features
1. Create a new branch:
```bash
git checkout -b feature/my-new-feature
```

2. Make your changes

3. Test thoroughly:
```bash
npm run build
```

4. Commit and push:
```bash
git add .
git commit -m "Add new feature"
git push origin feature/my-new-feature
```

### Database Changes
When modifying the Prisma schema:
```bash
cd packages/database
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

---

## 🐛 Troubleshooting

### "Can't reach database server"
**Solution:**
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart if needed
docker compose restart postgres

# Check logs
docker compose logs postgres
```

### "Module not found: @feedback-guru/database"
**Solution:**
```bash
cd packages/database
npx prisma generate
```

### Widget not loading
**Solution:**
1. Check widget server is running on port 3001
2. Check browser console for CORS errors
3. Verify API key is correct
4. Check widget.js is accessible at http://localhost:3001/widget.js

### Port already in use
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (replace PID)
kill -9 PID
```

---

## 📚 Key Concepts

### API Keys
- Each project has a unique API key
- API keys authenticate widget requests
- Never commit API keys to git
- Rotate keys if compromised

### Feedback States
- **NEW** - Just submitted
- **OPEN** - Acknowledged, needs action
- **IN_PROGRESS** - Being worked on
- **RESOLVED** - Fixed/implemented
- **CLOSED** - No further action needed
- **WONT_FIX** - Decided not to implement

### Widget Configuration
```javascript
fg('init', {
  apiKey: 'YOUR_API_KEY',           // Required
  position: 'bottom-right',          // Optional: bottom-left, top-right, top-left
  primaryColor: '#6366f1',           // Optional: Any hex color
  buttonText: 'Feedback',            // Optional: Custom button text
  language: 'en',                    // Optional: i18n (future)
});
```

---

## 🧪 Testing

### Manual Testing
1. Start both servers (dashboard + widget)
2. Open test page: http://localhost:3001/test.html
3. Submit feedback with screenshot
4. Verify in dashboard

### Widget Integration Test
1. Create a simple HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <h1>Hello World</h1>

  <!-- Widget Code -->
  <script>
    (function(w,d,s,o,f,js,fjs){
      w['FeedbackGuru']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
      js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
      js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'fg', 'http://localhost:3001/widget.js'));
    fg('init', { apiKey: 'YOUR_API_KEY' });
  </script>
</body>
</html>
```

2. Open in browser
3. Click feedback button
4. Submit feedback
5. Check dashboard

---

## 🚀 Production Deployment

### Environment Variables
Create `.env.production`:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="your-bucket"
NEXT_PUBLIC_CDN_URL="https://cdn.your-domain.com"
```

### Deploy to Vercel (Dashboard)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

### Deploy Widget to CDN
1. Build widget:
```bash
cd apps/widget
npm run build
```

2. Upload `dist/widget.min.js` to:
   - Cloudflare CDN
   - AWS CloudFront
   - Vercel Edge
   - Any CDN

3. Update widget URL in project settings

---

## 📊 Database Management

### Prisma Studio (GUI)
```bash
cd packages/database
npx prisma studio
```
Opens at: **http://localhost:5555**

### Backup Database
```bash
docker exec feedback-guru-db pg_dump -U feedbackguru feedbackguru > backup.sql
```

### Restore Database
```bash
docker exec -i feedback-guru-db psql -U feedbackguru feedbackguru < backup.sql
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Rotate API keys regularly**
3. **Use HTTPS in production**
4. **Enable rate limiting**
5. **Validate all user input**
6. **Sanitize feedback content**
7. **Use CSP headers**
8. **Enable CORS correctly**

---

## 📖 Further Reading

- **[BRAINSTORM.md](./BRAINSTORM.md)** - Product vision & features
- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Development guide
- **[COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)** - Market analysis
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup verification

---

## 💡 Tips & Tricks

### Open Widget Programmatically
```javascript
// From browser console or your code
fg('open');
```

### Close Widget
```javascript
fg('close');
```

### Custom Styling
The widget uses inline styles, but you can override with CSS:
```css
#fg-trigger-button {
  /* Your custom styles */
}
```

---

## 🆘 Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/feedback-guru/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/feedback-guru/discussions)
- **Email**: support@feedbackguru.com
- **Discord**: [Join our community](https://discord.gg/feedbackguru)

---

## 🎉 You're All Set!

You now have a fully functional feedback collection system:
- ✅ Dashboard running at http://localhost:3000
- ✅ Widget available at http://localhost:3001
- ✅ Database configured and migrated
- ✅ Test page to demo the widget

**Next Steps:**
1. Customize the widget colors to match your brand
2. Add the widget to your website
3. Start collecting feedback!
4. Organize feedback in the kanban board
5. Respond to users and improve your product

**Happy coding! 🚀**
