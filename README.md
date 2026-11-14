# Al-Souq (السوق)
### Visual Commerce & High-Trust Classifieds Platform for the Dawoodi Bohra Community

Al-Souq is a mobile-first, full-stack platform tailored specifically for the Dawoodi Bohra community worldwide, blending:
1. **The Visual Souq:** Instagram-style daily discovery feed for verified home bakers, Bohra Thaali caterers, Rida/jhabla designers, and Khatt (calligraphy) artists.
2. **Mumin Classifieds & NoBroker Real Estate:** High-trust P2P marketplace for Masjid-proximate flat rentals/sales with zero brokerage, thaali-friendly tags, relocation clearance, and commercial catering equipment.
3. **Strict Manual Admin ITS Verification:** Multi-tier trust system where users upload their 8-digit ITS card proof for manual review and approval by community admins.

---

## 🚀 Key Features

* **Visual Souq Feed:** 24h stories for fresh weekend food pop-ups, high-res carousel posts, and pre-filled `"Order on WhatsApp"` lead generation.
* **Mumin Classifieds & NoBroker:** Real estate listings with `near_masjid`, `thaali_friendly`, `zero_brokerage` filters, mohalla tags (Mazgaon, Bhendi Bazaar, Byculla, Marol, Mira Road, etc.), and relocation clearance furniture.
* **Self Sign-In & Registration Portal:** Dedicated portal at `/login` supporting email/phone + password or instant WhatsApp OTP (`123456`), and personalized profile desk at `/profile`.
* **Admin Verification Desk:** Moderation dashboard at `/admin` to review uploaded ITS cards, zoom into proof documents, approve/reject with custom reasons, and manage business Raza badges.
* **Persistent Database Engine:** Native file-backed storage in `.data/alsouq_database.json` + production PostgreSQL Prisma schema in `prisma/schema.prisma`.
* **Zero Lorem Ipsum:** Pre-seeded with authentic Dawoodi Bohra community data across Mumbai, Surat, Dubai, London, and Houston.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router), TypeScript
* **Styling:** Tailwind CSS, Custom Bohra theme (`#064e3b` emerald, `#d4af37` gold, `#faf8f5` warm cream)
* **Icons & Animation:** Lucide Icons, Framer Motion, Canvas Confetti
* **Database & ORM:** PostgreSQL + Prisma (`prisma/schema.prisma`) and local file-backed persistence
* **Deployment Ready:** Multi-stage `Dockerfile`, `docker-compose.yml`, and `vercel.json`

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🚢 Free Deployment Guide

See [DEPLOYMENT.md](file:///Users/murtuzabagasrawala/Desktop/BohraOLX/DEPLOYMENT.md) for step-by-step instructions on deploying for free to **Vercel + Neon PostgreSQL** or via **Docker**.
