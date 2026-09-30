# Nam-Watch (น้ำวอทช์)

A public, mobile-first web app that lets people monitor water levels in Bangkok and Pathum Thani.
Data is provided by the Thai National Water Data Warehouse (คลังข้อมูลน้ำแห่งชาติ, HII).

**Disclaimer:** ข้อมูลเพื่อการติดตามเท่านั้น ไม่ใช่การประกาศเตือนภัยอย่างเป็นทางการ

## Prerequisites

- Node.js 20.x
- pnpm 9.x+ (or 12.x)
- Supabase account (free tier)

## Local Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in your Supabase details.
   ```bash
   cp .env.example .env.local
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

- **Lint:** `pnpm lint`
- **Typecheck:** `pnpm typecheck`
- **Unit Tests:** `pnpm test` (or `pnpm test:run` for CI)

## Architecture

- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui, Recharts, react-leaflet
- **Database:** Supabase (Postgres)
- **Data Ingestion:** GitHub Actions cron job running `scripts/ingest.ts` (every 30 mins)
