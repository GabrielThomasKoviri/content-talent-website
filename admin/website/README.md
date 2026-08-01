# TalentSea Admin Web Dashboard

A modern, responsive, and feature-rich Admin Web Application for managing video content, playlists, subscriber analytics, subscription plans, community engagements, branding, and system settings.

---

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool / Dev Server**: [Vite 6](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens / CSS Variables
- **UI Components**: Radix UI Primitives, Shadcn UI patterns, [Lucide React](https://lucide.dev/) Icons, [Recharts](https://recharts.org/) for data visualization
- **Video & Upload Integration**: [TUS JS Client](https://tus.io/) (Resumable Uploads), [HLS.js](https://github.com/video-dev/hls.js/) (HLS Video Streaming)

---

## 📁 Directory & Website Structure

```text
admin/website/
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tsconfig.json               # TypeScript compiler options
├── API_DOCUMENTATION.md        # Comprehensive REST API reference guide
├── WIREFRAMES_GUIDE.md         # Wireframe UI specification and design documentation
├── dist/                       # Production build output (generated on build)
└── src/                        # Main application source code
    ├── main.tsx                # React root entry point
    ├── global.d.ts             # Global TypeScript type definitions & environment declarations
    ├── app/
    │   ├── App.tsx             # Root React Router provider component
    │   ├── routes.tsx          # Client-side router configuration & path definitions
    │   ├── components/
    │   │   ├── AdminLayout.tsx # Main dashboard layout (Sidebar navigation, Header, Content Area)
    │   │   └── ui/             # Reusable UI elements (Buttons, Dialogs, ImageWithFallback, etc.)
    │   ├── pages/              # Application View Pages
    │   │   ├── Dashboard.tsx          # Main metrics overview & recent activity
    │   │   ├── ContentManagement.tsx  # Video upload (TUS), editing, thumbnail selection & Playlists
    │   │   ├── Subscribers.tsx        # Subscriber management & subscription details
    │   │   ├── SubscriptionPlans.tsx  # Tier & pricing plan configuration
    │   │   ├── Analytics.tsx          # Video watch time, engagement, & audience analytics
    │   │   ├── Revenue.tsx            # Revenue metrics, earnings & payout breakdowns
    │   │   ├── Community.tsx          # Moderation, comments & community posts
    │   │   ├── Branding.tsx           # App customization, logos, colors & theme settings
    │   │   ├── Categories.tsx         # Content taxonomy & category management
    │   │   └── Settings.tsx           # Platform settings, admin profile & API integrations
    │   └── services/
    │       └── apiService.ts   # Centralized REST API client & data transformers
    ├── imports/                # Asset imports & helper utilities
    └── styles/                 # Global styles, fonts, and theme configurations
        ├── globals.css         # Base global styles
        ├── tailwind.css        # Tailwind directive imports
        └── theme.css           # Theme colors, CSS variables & typography tokens
```

---

## 🌐 Routes & Page Features

| Route Path | Page Component | Feature Overview |
| :--- | :--- | :--- |
| `/` | `Dashboard` | High-level metrics (total subscribers, revenue, video views), recent activity feeds, quick action shortcuts. |
| `/content` | `ContentManagement` | Comprehensive video & playlist lifecycle management. Features TUS resumable uploads, multi-slot thumbnail selection, scheduling, and playlist ordering. |
| `/subscribers` | `Subscribers` | User roster, active subscription tiers, status filtering (active/canceled/past_due), and user action drawer. |
| `/plans` | `SubscriptionPlans` | Tier creation & edit modals, pricing details, feature matrix, and trial period configurations. |
| `/analytics` | `Analytics` | Graphical reporting on watch time, total views, active user growth, and content performance metrics via Recharts. |
| `/revenue` | `Revenue` | Financial overview, MRR/ARR charts, payout breakdowns, and transaction export actions. |
| `/community` | `Community` | Moderation tools for comment review, post management, flag reporting, and user moderation actions. |
| `/branding` | `Branding` | White-label custom colors, logo uploads, splash screen previews, and app header styling. |
| `/categories` | `Categories` | Category creation, content tagging, taxonomy structure, and display ordering. |
| `/settings` | `Settings` | System configurations, admin profile settings, API keys, webhook configurations, and security settings. |

---

## ⚡ Execution & How to Run

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher
- **npm** (v9+) or **pnpm** / **yarn**

---

### Step 1: Install Dependencies

Navigate to the `admin/website` directory and run:

```bash
npm install
```

---

### Step 2: Environment Configuration (Optional)

By default, the application connects to the default backend REST API. You can override the backend URL or access token by creating a `.env.local` file or declaring environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TOKEN=your_secret_admin_token
```

---

### Step 3: Run Development Server

To launch the local development server with Hot Module Reloading (HMR):

```bash
npm run dev
```

The application will start by default at:
`http://localhost:5173` (or the next available port indicated in the terminal).

---

### Step 4: Build for Production

To create an optimized production build:

```bash
npm run build
```

The compiled assets will be output to the `dist/` directory, ready to be served by Nginx, Apache, or any static hosting service (Vercel, Netlify, Cloudflare Pages).

---

## 🔗 Backend API Integration

The admin website communicates with the backend REST server via `src/app/services/apiService.ts`.

- **Base Endpoint**: `http://138.68.140.83:8000` (or `VITE_API_BASE_URL`)
- **Authentication**: Bearer Token in `Authorization` Header (`localStorage.getItem("access_token")` or `VITE_API_TOKEN`)
- **Resumable Uploads**: Video binary uploads are handled via `tus-js-client` chunked upload protocol endpoint (`/api/v1/admin/videos/initiate` & TUS server).