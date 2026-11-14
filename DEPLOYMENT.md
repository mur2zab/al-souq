# 🚀 Al-Souq (السوق) – 100% Free Production Deployment & DNS Guide

This guide shows you how to deploy **Al-Souq** for **$0 / month** on free cloud infrastructure with **everything completely empty** (clean slate for real community listings) and get **free DNS & HTTPS domains**.

---

## 🌟 100% Free Stack Overview (Zero Cost Forever)

| Component | Provider | Free Allowance | Why It's Best |
| :--- | :--- | :--- | :--- |
| **Hosting & Edge CDN** | [Vercel](https://vercel.com) | 100 GB/mo bandwidth, unlimited deployments | Native Next.js 14 support, 0 cold starts |
| **Serverless PostgreSQL** | [Neon.tech](https://neon.tech) | 0.5 GB SSD storage (~500,000 listings) | Auto-scales to zero, free SSL, zero card needed |
| **Free DNS & Subdomain** | Vercel (`.vercel.app`) or [DuckDNS](https://www.duckdns.org) | Permanent free DNS with automated HTTPS | 1-click wildcard SSL certificates |
| **Object Storage (Media)** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | 10 GB storage / 10M reads / $0 egress | Zero bandwidth fees for high-res images |

---

## 🧹 Step 1: Deploy with "Everything Empty" (Clean Slate)

To ensure no mock demo posts, fake flats, or sample test accounts appear on your live site:

### Locally:
Run the built-in database reset script:
```bash
npm run db:empty
```
This resets the database so:
* 📦 **Visual Souq Posts:** `0` (Clean)
* 🏠 **Classified Ads & Flats:** `0` (Clean)
* ⚡ **24h Flash Stories:** `0` (Clean)
* 🛡️ **Pending ITS KYC Cards:** `0` (Clean)
* 👑 **Single Admin Account Created:**
  * **Email:** `admin@alsouq.community` *(or set via `ADMIN_EMAIL`)*
  * **Password:** `Admin@123` *(or set via `ADMIN_PASSWORD`)*
  * **Role:** `ADMIN` (Full verification privileges at `/admin`)

### In Vercel Environment Variables:
Set:
```env
EMPTY_DATABASE=true
NEXT_PUBLIC_EMPTY_DATABASE=true
ADMIN_EMAIL=admin@alsouq.community
ADMIN_PASSWORD=Admin@AlSouq2026
```

---

## 🌐 Step 2: Get Free DNS & Domain Name

You have two 100% free options for your website address:

### Option A: Instant Free Vercel Domain (Zero Config)
When you deploy on Vercel, you automatically get a free permanent URL with global Anycast DNS:
* `https://alsouq.vercel.app` (or any name you choose, e.g. `https://bohra-souq.vercel.app`)
* Includes automatic Let's Encrypt SSL (HTTPS).
* Zero setup required.

### Option B: Free Custom Subdomain with DuckDNS (`.duckdns.org`)
If you want a custom domain without buying one:
1. Go to [DuckDNS.org](https://www.duckdns.org) and sign in with GitHub or Google.
2. Under **Domains**, pick your subdomain name (e.g. `alsouq` -> `alsouq.duckdns.org`).
3. Point the CNAME record:
   * **Domain:** `alsouq.duckdns.org`
   * **Target:** `cname.vercel-dns.com`
4. In your Vercel Dashboard:
   * Go to **Settings** -> **Domains**.
   * Add `alsouq.duckdns.org`.
   * Vercel will verify the DNS and issue a free SSL certificate automatically!

---

## ⚡ Step 3: Step-by-Step Free Cloud Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "feat: ready for clean production deployment"
git branch -M main
# Create a repository on github.com (e.g. alsouq) and run:
git remote add origin https://github.com/<your-github-username>/alsouq.git
git push -u origin main
```

### 2. Create Your Free Database on Neon
1. Go to [Neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project**:
   * **Name:** `alsouq-db`
   * **Region:** Choose closest to your users (e.g. `AWS ap-south-1 (Mumbai)` or `AWS eu-central-1 (Frankfurt)`).
3. Under **Connection Details**, copy your connection string:
   ```text
   postgresql://neondb_owner:password123@ep-cool-pond-a1b2c3.ap-south-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Deploy on Vercel
1. Log in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Select your `alsouq` repository and click **Import**.
4. In **Environment Variables**, add the following:

| Name | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:...` | Neon Free PostgreSQL connection |
| `SESSION_SECRET` | `alsouq_super_secure_32_char_secret_key_2026` | Encrypted session token cookie |
| `EMPTY_DATABASE` | `true` | Starts with zero fake posts/listings |
| `NEXT_PUBLIC_EMPTY_DATABASE` | `true` | Tells frontend to load clean state |
| `ADMIN_EMAIL` | `admin@alsouq.community` | Your initial admin login |
| `ADMIN_PASSWORD` | `Admin@AlSouq2026` | Your initial admin password |
| `NEXT_PUBLIC_APP_URL` | `https://alsouq.vercel.app` | Base URL of your app |

5. Click **Deploy**!
   * In under 60 seconds, your application is live on the internet!

---

## 🔑 Step 4: Admin Desk & First Community Listings

1. **Log in as Administrator:**
   * Go to `https://<your-app>.vercel.app/login`
   * Enter your admin email: `admin@alsouq.community` and password: `Admin@AlSouq2026`
   * You are now signed in as **Community Admin**.
2. **Access Admin Desk (`/admin`):**
   * Visit `https://<your-app>.vercel.app/admin`
   * As new Mumineen upload their 8-digit ITS Smart Cards, their submissions will appear here.
   * Click any card to inspect full-resolution proof with zoom.
   * Approve or reject with structured reasons.
3. **Post First Real Listings:**
   * Click **+ Post** in the bottom navigation or header to post your community's first real Visual Drop or NoBroker flat rental!
