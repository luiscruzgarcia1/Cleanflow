# CleanFlow Project Reference

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js with Credentials provider
- **Payments**: Stripe SDK
- **Icons**: lucide-react
- **Charts**: recharts

## Project Location
All code lives in: `/home/team/shared/cleanflow-app`

## Directory Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout (wraps AuthLayout)
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── customers/page.tsx
│   ├── schedule/page.tsx
│   ├── quotes/page.tsx
│   ├── invoices/page.tsx
│   ├── employees/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/register/route.ts
│       ├── dashboard/route.ts
│       ├── customers/route.ts
│       ├── jobs/route.ts
│       ├── invoices/route.ts
│       ├── employees/route.ts
│       ├── quotes/route.ts
│       ├── subscription/route.ts
│       ├── chatbot/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── layout/
│   │   ├── AuthLayout.tsx   # Session provider + sidebar wrapper
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── ui/                  # Reusable UI components
│   ├── customers/
│   ├── schedule/
│   ├── quotes/
│   ├── invoices/
│   └── employees/
├── lib/
│   ├── db.ts                # Prisma client singleton
│   ├── ai.ts                # AI quote generator, chatbot, helpers
│   ├── types.ts             # Types, subscription plans, constants
│   └── utils.ts             # Utility functions
└── data/
    └── navigation.ts        # Navigation items
```

## Database
Prisma schema: `/home/team/shared/cleanflow-app/prisma/schema.prisma`
Models: User, Customer, Employee, Job, Invoice, BusinessSetting

## Design System
- **Primary**: Blue-600 (#2563EB)
- **Background**: Gray-50 (#F8FAFC)
- **Cards**: White with gray-200 borders
- **Typography**: Gray-900 headings, gray-600 body
- **Border radius**: rounded-lg (8px), rounded-xl (12px)

## Running the App
```bash
cd /home/team/shared/cleanflow-app
npm run dev
```
The app runs on http://localhost:3000