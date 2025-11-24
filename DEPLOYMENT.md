# 🚀 Deployment Guide - Nocturne

This guide covers deploying Nocturne to Vercel.

---

## 📋 Pre-Deployment Checklist

- [x] All code committed to Git
- [x] Tests passing (`pnpm test`)
- [x] Build successful (`pnpm build`)
- [x] Environment variables documented
- [x] README updated
- [x] License file added

---

## 🌐 Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: production-ready deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import `chizee/nocturne-ai-taskmanager`
   - Vercel auto-detects Next.js settings

3. **Configure:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables

Nocturne doesn't require environment variables for basic functionality (all data is stored locally in the browser).

### Optional Variables

If you add backend features later:

```env
# Example for future features
NEXT_PUBLIC_API_URL=https://api.nocturne.app
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

Add these in Vercel Dashboard → Settings → Environment Variables

---

## 📦 Build Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker (optional)
  images: {
    domains: [], // Add if using external images
  },
}

module.exports = nextConfig
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 🎬 Welcome Page Setup

### For Production

1. **Add Video File:**
   - Upload `nocturne-intro.mp4` to `public/assets/intro-video/`
   - Recommended: < 10MB, 1920x1080, H.264 codec

2. **Add Fallback Image:**
   - Upload `nocturne-intro.png` to `public/assets/image/`
   - Recommended: < 500KB, 1920x1080

3. **Set as Landing Page (Optional):**
   
   **Option A:** Redirect from root
   ```javascript
   // In src/app/page.tsx or middleware
   redirect('/welcome.html')
   ```

   **Option B:** Vercel rewrites
   ```json
   // vercel.json
   {
     "rewrites": [
       { "source": "/", "destination": "/welcome.html" }
     ]
   }
   ```

---

## 🔍 Post-Deployment Checks

### 1. Functionality
- [ ] Tasks can be created, edited, deleted
- [ ] AI Focus Coach generates plans
- [ ] Timer works correctly
- [ ] CSV import/export functions
- [ ] Theme switching works
- [ ] Welcome page video plays

### 2. Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 200KB

### 3. Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Focus indicators visible

### 4. Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
- Real User Monitoring (RUM)
- Web Vitals tracking
- Error logging

### Custom Analytics (Optional)

Add to `src/app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** TypeScript errors
```bash
# Fix locally first
pnpm build
# Fix errors, then commit
```

**Issue:** Missing dependencies
```bash
# Ensure package.json is complete
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "fix: update dependencies"
```

### Video Not Playing

**Issue:** Video file too large
- Compress video to < 10MB
- Use H.264 codec
- Consider using a CDN

**Issue:** Autoplay blocked
- This is normal browser behavior
- The "Play Video" button will appear
- Users must click to start with audio

### 404 Errors

**Issue:** Static files not found
- Ensure files are in `public/` directory
- Check file paths are correct
- Rebuild and redeploy

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main`:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys if successful
# 4. Sends notification
```

### Preview Deployments

Every PR gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

---

## 🌍 Custom Domain

### Add Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `nocturne.app`)
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated

---

## 📈 Performance Optimization

### Already Optimized

- ✅ Next.js automatic code splitting
- ✅ Image optimization
- ✅ Font optimization (Google Fonts)
- ✅ CSS purging (Tailwind)
- ✅ Gzip compression

### Additional Optimizations

1. **Enable Edge Functions:**
   ```javascript
   // src/app/api/route.ts
   export const runtime = 'edge'
   ```

2. **Add Caching Headers:**
   ```javascript
   // next.config.js
   async headers() {
     return [
       {
         source: '/assets/:path*',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=31536000, immutable',
           },
         ],
       },
     ]
   }
   ```

---

## ✅ Deployment Complete!

Your Nocturne app is now live! 🎉

**Next Steps:**
1. Share the URL with users
2. Monitor analytics
3. Gather feedback
4. Iterate and improve

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Issues](https://github.com/chizee/nocturne-ai-taskmanager/issues)

---

**Built with 💜 and a touch of 👻 using Kiro**
