# TalentSea White-Label Admin Website — Comprehensive File-by-File Reference

This document provides a complete, from-scratch explanation of **every file** in the TalentSea Admin Website codebase (`admin/website/`) as well as the documentation files housed within `admin/website/docs/`.

---

## Table of Contents
1. [Documentation Architecture (`docs/`)](#1-documentation-architecture-docs)
2. [Root Configuration & Build Files](#2-root-configuration--build-files)
3. [Application Entry Points & Core Infrastructure (`src/`)](#3-application-entry-points--core-infrastructure-src)
4. [Page Components (`src/app/pages/`)](#4-page-components-srcapppages)
5. [Layout & Global Components (`src/app/components/`)](#5-layout--global-components-srcappcomponents)
6. [Design System UI Primitives (`src/app/components/ui/`)](#6-design-system-ui-primitives-srcappcomponentsui)
7. [Service Layer & API Clients (`src/app/services/`)](#7-service-layer--api-clients-srcappservices)
8. [Stylesheets & Theme Definitions (`src/styles/`)](#8-stylesheets--theme-definitions-srcstyles)

---

## 1. Documentation Architecture (`docs/`)

The `docs/` folder contains the technical blueprints, backend REST API contracts, and full architectural flows for the white-label admin platform:

### 1.1 `docs/website_flow/README.md`
- **Purpose**: The master end-to-end guide for the entire website.
- **What it does**:
  - Explains the complete user flow starting from `/login` through all 10 application pages.
  - Documents the React 18 + Vite SPA rendering mechanics, routing lifecycle, and the Bress design system.
  - Contains a **Master API Matrix of 60 endpoints**, mapping every REST endpoint to its frontend calling function in `apiService.ts`, payload, and consuming UI component.
  - Includes **Mermaid Sequence Diagrams** for session verification, TUS video uploads, and cross-component live event synchronization.

### 1.2 `docs/admin/video_management_api_specification.md`
- **Purpose**: Backend API contract specification for video lifecycle and streaming assets.
- **What it does**:
  - Details the JWT authentication and authorization rules for video assets.
  - Specifies the direct-to-cloud TUS resumable upload protocol integration with Bunny Stream.
  - Outlines the 4-state lifecycle (`processing` → `draft` → `scheduled` → `published`) and `publish_intent` options.
  - Defines the 3-slot thumbnail storage protocol (Main, Alt 1, Alt 2) via Bunny Storage CDN.
  - Documents video publishing, unpublishing, scheduling, and bulk deletion contracts.

### 1.3 `docs/admin/playlist_management_api_specification.md`
- **Purpose**: Backend API contract specification for playlist curation and ordering.
- **What it does**:
  - Defines the endpoints for creating, updating, listing, and deleting playlists.
  - Details the multipart form upload endpoint for playlist cover banners (`/api/v1/admin/playlists/{id}/banner`).
  - Specifies the playlist tracklist management endpoints (adding videos, removing videos, and reordering track sequences).

### 1.4 `docs/admin/comments_management_api_specification.md`
- **Purpose**: Backend API contract specification for community comment moderation.
- **What it does**:
  - Specifies comment retrieval across all content with search and video filtering.
  - Defines the endpoint for posting official creator replies marked with verified badges (`POST /comments/{id}/replies`).
  - Documents the creator like toggle (`POST /comments/{id}/like`) using the unified `comment_likes` junction table.
  - Specifies comment deletion and moderation authorization rules.

### 1.5 `docs/admin/settings_profile_api_specification.md`
- **Purpose**: Backend API contract specification for creator profile and social accounts.
- **What it does**:
  - Defines `GET` and `PUT` endpoints for creator profile metadata (`first_name`, `last_name`, `bio`, `phone`, `location`).
  - Specifies the avatar photo upload endpoint (`POST /api/v1/admin/profile/avatar`) uploading to Bunny Storage CDN.
  - Outlines social media account link persistence (Twitter, YouTube, Instagram).
  - Clarifies security boundaries regarding read-only email identities.

---

## 2. Root Configuration & Build Files

These files configure the build tooling, compiler, dependencies, and environment:

- **`package.json`**:
  - Declares project metadata, npm scripts (`dev`, `build`, `lint`, `preview`), and exact dependency trees.
  - Key dependencies include `react`, `react-dom`, `react-router`, `@radix-ui/*` primitives, `lucide-react`, `recharts`, `hls.js`, `tus-js-client`, `tailwindcss`, and `clsx`.
- **`package-lock.json`**:
  - Cryptographic dependency lockfile ensuring identical deterministic module installations across environments.
- **`vite.config.ts`**:
  - Vite build configuration with the official `@vitejs/plugin-react`.
  - Configures path aliases (`@/` mapping to `./src/`).
  - Configures development proxy rules (`/api` routed to `http://localhost:8000`) to eliminate browser CORS and ngrok browser warnings during local development.
- **`tsconfig.json`**:
  - TypeScript compiler options: strict type checking, ESNext module resolution, JSX React 18 runtime, and path mapping definitions.
- **`index.html`**:
  - Root HTML entry document. Contains the viewport meta configuration, favicon, font preloads, and the `<div id="root"></div>` mount element where React renders.
- **`vercel.json`**:
  - Vercel production hosting configuration. Specifies client-side SPA rewrite rules (`"source": "/(.*)", "destination": "/index.html"`) so that direct visits to nested routes (e.g., `/content`, `/settings`) resolve correctly.
- **`.env` / `.env.example`**:
  - Environment variable declarations (e.g. `VITE_API_BASE_URL`).
- **`pnpm-workspace.yaml`**:
  - Monorepo workspace configuration if pnpm is utilized across multi-package white-label repositories.
- **`README.md`**:
  - Project summary, setup instructions, and quickstart commands for local developers.
- **`ATTRIBUTIONS.md`**:
  - Attribution notices and open-source licenses for UI libraries and assets used in the application.
- **`WIREFRAMES_GUIDE.md`**:
  - Visual layout and wireframe specifications for responsive desktop and tablet viewports.
- **`EXPLANATION.md`**:
  - Conceptual architecture notes and overview of the platform design.
- **`guidelines/Guidelines.md`**:
  - Engineering rules, coding style conventions, and Bress design principles for frontend contributors.

---

## 3. Application Entry Points & Core Infrastructure (`src/`)

- **`src/main.tsx`**:
  - Application bootstrapping entry point.
  - Imports global stylesheets (`globals.css`, `fonts.css`, `theme.css`).
  - Calls `ReactDOM.createRoot(document.getElementById("root")!)` and mounts `<App />` within React Concurrent Mode.
- **`src/app/App.tsx`**:
  - Top-level application component that renders `<RouterProvider router={router} />`.
- **`src/app/routes.tsx`**:
  - Central routing definition using React Router v7 `createBrowserRouter`.
  - Declares the public route `/login` and the authenticated shell `/` wrapped by `AdminLayout`.
  - Configures `RouteErrorBoundary`, catching render-time JavaScript exceptions and displaying a recovery card without crashing the entire app.
  - Registers child routes: Dashboard (`/`), Content (`/content`), Subscribers (`/subscribers`), Plans (`/plans`), Analytics (`/analytics`), Revenue (`/revenue`), Community (`/community`), Branding (`/branding`), Categories (`/categories`), and Settings (`/settings`).
- **`src/global.d.ts`**:
  - Ambient TypeScript declarations for image imports (`.png`, `.jpg`, `.svg`) and global browser window extensions.

---

## 4. Page Components (`src/app/pages/`)

Each file in this folder represents a dedicated administrative screen:

### 4.1 `src/app/pages/Login.tsx`
- **Route**: `/login`
- **What it does**:
  - Provides the creator login portal with email and password inputs.
  - Integrates the interactive character animation component (`CreativeLoginCharacters.tsx`).
  - Submits credentials via `adminLogin()`, saves JWT access tokens in `localStorage`, and receives HttpOnly refresh cookies.
  - Redirects authenticated creators to `/` or their previously requested route.

### 4.2 `src/app/pages/Dashboard.tsx`
- **Route**: `/`
- **What it does**:
  - Executive overview displaying 5 core Bress KPI cards: Total Revenue, Total Views, Subscribers, Total Users, and Content Inventory (published, drafts, scheduled).
  - Renders Recharts area charts displaying trends across customizable date ranges (7d, 30d, 90d, 1y).
  - Displays subscription tier distribution and a live paginated roster of recent subscriber sign-ups.
  - Shows quick-access recent video upload cards with direct play and edit links.

### 4.3 `src/app/pages/ContentManagement.tsx`
- **Route**: `/content`
- **What it does**:
  - Comprehensive video and playlist manager with a two-tab interface.
  - **Video Engine**:
    - Direct TUS resumable upload protocol to Bunny Stream CDN with live speed and percentage progress indicators.
    - Manages the 4-state video lifecycle: `processing`, `draft`, `scheduled`, and `published`.
    - Supports `publish_intent` handling (`draft`, `publish`, `schedule`).
    - 3-slot thumbnail management: upload to Slot 1 (main) or Slot 2/3 (alternatives), promote slot to main, or delete thumbnail.
    - Immediate publishing (`publishVideo`), unpublishing (`unpublishVideo`), and scheduled release (`scheduleVideo`).
    - Bulk multi-select and deletion (`bulkDeleteVideos`).
    - Integrated HLS video player preview modal with WebVTT subtitle track rendering.
    - Silent 8-second background polling that refreshes transcoding progress without resetting scroll position.
  - **Playlists Tab**:
    - Complete CRUD operations for playlists.
    - Banner image upload to Bunny Storage.
    - Playlist tracklist inspector: add videos, remove videos, and reorder tracks.

### 4.4 `src/app/pages/Subscribers.tsx`
- **Route**: `/subscribers`
- **What it does**:
  - Audience management view listing all registered and paying subscribers.
  - Search input with debounced query matching on subscriber names and emails.
  - Filter by subscription status: All, Active, Past Due, Canceled.
  - Paginated data table showing avatar, plan badge, total spend, and join dates.

### 4.5 `src/app/pages/SubscriptionPlans.tsx`
- **Route**: `/plans`
- **What it does**:
  - Creator subscription tier pricing and packaging management.
  - Renders cards for each tier showing monthly/annual rates, currency, and feature checklist.
  - Instant visibility toggle (`toggleSubscriptionPlanActive`) to enable or disable tiers in subscriber mobile apps.
  - Reorder controls to adjust the priority order in which plans are presented.

### 4.6 `src/app/pages/Analytics.tsx`
- **Route**: `/analytics`
- **What it does**:
  - Deep-dive telemetry view for channel performance and viewer retention.
  - Graphs for viewer acquisition, average watch duration, completion rates, and platform breakdown (iOS, Android, Web).
  - Content leaderboard ranking top videos by views, likes, and watch time.

### 4.7 `src/app/pages/Revenue.tsx`
- **Route**: `/revenue`
- **What it does**:
  - Financial operations and monetization control center.
  - Displays current period estimated revenue, eCPM, and expected payout date.
  - Shows pending payouts and last reconciled payout with bank UTR transaction numbers.
  - Historical settlement ledger table with invoice download links.
  - Payout settings modal to register Account Holder Name, Bank Account Number, and IFSC Code.

### 4.8 `src/app/pages/Community.tsx`
- **Route**: `/community`
- **What it does**:
  - Community moderation dashboard for video comments.
  - Filter comments by specific video or search by commenter name/text.
  - Inline composer for official creator replies with verified badge styling.
  - Creator heart / like toggle (`toggleCommentLike`) on comments.
  - Moderation deletion action to remove inappropriate or spam comments.

### 4.9 `src/app/pages/Branding.tsx`
- **Route**: `/branding`
- **What it does**:
  - Creator white-label customization interface.
  - Configure Studio Name, Tagline, Description, and brand color palette.
  - Multi-asset graphic uploaders: App Logo, Web Banner, and Mobile Splash screens.
  - Featured Video Carousel editor: select published videos, reorder carousel slides, or remove videos.
  - Dispatches `window.dispatchEvent("branding_updated")` on save, instantly updating the global shell header.

### 4.10 `src/app/pages/Categories.tsx`
- **Route**: `/categories`
- **What it does**:
  - Content taxonomy manager for categorizing videos.
  - Lists categories with thumbnails, video counts, and active status.
  - Create and edit dialogs supporting direct category image upload via `uploadCategoryThumbnail` to Bunny Storage.
  - Reorder up/down controls to adjust category arrangement in consumer apps.
  - Safe deletion workflow.

### 4.11 `src/app/pages/Settings.tsx`
- **Route**: `/settings`
- **What it does**:
  - Creator profile and administrative settings.
  - Profile details form: First Name, Last Name, Public Email, Phone, Location, Bio.
  - Profile photo / avatar upload to Bunny Storage.
  - Social media profile links: Twitter, YouTube, Instagram.
  - Bank payout profile configuration (Account Name, Bank Name, Masked Number, IFSC).

---

## 5. Layout & Global Components (`src/app/components/`)

- **`src/app/components/AdminLayout.tsx`**:
  - The master persistent shell wrapping all authenticated screens.
  - **Auth Session Gatekeeper**: Verifies JWT access tokens with `adminGetMe()`. If expired, invokes `adminRefresh()` via HttpOnly cookie; if unauthorized, redirects to `/login`.
  - **Collapsible Sidebar**: Renders 10 navigation items with active link highlights and persists collapsed state in `localStorage.sidebar_collapsed`.
  - **Live Header Bar**: Displays studio logo and name, listens for `branding_updated` window events, and renders global search, notifications, and avatar dropdowns.
  - **Profile Quick-Edit Modal**: Allows immediate editing of creator profile metadata and displays channel stats (video count, subscribers, views).
  - **Outlet Container**: Renders the active child route component via React Router `<Outlet />`.
- **`src/app/components/ApiResponseMonitor.tsx`**:
  - Floating developer drawer component that captures and displays real-time network requests, HTTP status codes, method types, endpoints, and latency metrics.
- **`src/app/components/CreativeLoginCharacters.tsx`**:
  - Animated SVG illustration component featured on the login screen. Characters visually react, follow cursor focus, and peek or look away based on email and password field focus states.

---

## 6. Design System UI Primitives (`src/app/components/ui/`)

Accessible, unstyled Radix UI primitives wrapped with Tailwind CSS following Bress Design System specifications:

- **`button.tsx`**: Primary, secondary, outline, ghost, and destructive buttons with size variants.
- **`card.tsx`**: Clean white surface containers with subtle slate borders and padding helpers.
- **`dialog.tsx`**: Accessible modal dialog primitives (overlay, content, header, title, description, footer).
- **`dropdown-menu.tsx`**: Floating dropdown menus for action triggers and user account navigation.
- **`input.tsx`**: Styled text, number, email, and password input fields.
- **`label.tsx`**: Accessible form label primitive based on Radix UI Label.
- **`select.tsx`**: Custom styled select dropdown menu primitive based on Radix UI Select.
- **`table.tsx`**: Semantic tabular data components (`Table`, `TableHeader`, `TableRow`, `TableCell`, `TableBody`).
- **`tabs.tsx`**: Accessible tabbed navigation switcher based on Radix UI Tabs.
- **`badge.tsx`**: Status indicator badges (Emerald for published, Blue for scheduled, Amber for processing, Slate for draft).
- **`avatar.tsx`**: Circular avatar component with image loading and fallback monogram initials.
- **`switch.tsx`**: Accessible toggle switch primitive based on Radix UI Switch.
- **`alert-dialog.tsx`**: Modal dialog for confirming destructive operations (e.g., delete video).
- **`alert.tsx`**: Alert message banners for error and warning notices.
- **`checkbox.tsx`**: Accessible checkbox input primitive.
- **`textarea.tsx`**: Multi-line textarea form input.
- **`separator.tsx`**: Horizontal and vertical layout divider rules.
- **`progress.tsx`**: Visual percentage bar for upload and transcode tracking.
- **`scroll-area.tsx`**: Custom scroll container primitive based on Radix UI ScrollArea.
- **`sheet.tsx`**: Slide-out drawer panel primitive.
- **`tooltip.tsx`**: Accessible hover tooltip component.
- **`popover.tsx`**: Floating popover container.
- **`accordion.tsx`**: Expandable and collapsible accordion panels.
- **`breadcrumb.tsx`**: Hierarchical navigation breadcrumb trails.
- **`calendar.tsx`**: Date picker calendar interface.
- **`carousel.tsx`**: Multi-slide carousel viewer.
- **`chart.tsx`**: Recharts responsive container wrappers and tooltip formatters.
- **`collapsible.tsx`**: Simple collapsible element wrapper.
- **`command.tsx`**: Command palette and search combo-box.
- **`context-menu.tsx`**: Custom right-click contextual menus.
- **`drawer.tsx`**: Mobile-optimized bottom drawer sheet.
- **`form.tsx`**: Form context and validation error message wrappers.
- **`hover-card.tsx`**: Hover card detail popovers.
- **`ImageWithFallback.tsx`**: Image wrapper that gracefully displays a fallback icon or placeholder if the target URL fails to load.
- **`input-otp.tsx`**: Segmented PIN / OTP input controls.
- **`menubar.tsx`**: Desktop application menubar component.
- **`navigation-menu.tsx`**: Header navigation link menus.
- **`pagination.tsx`**: Pagination buttons and page index controls.
- **`radio-group.tsx`**: Radio selection list primitives.
- **`resizable.tsx`**: Drag-to-resize split view layouts.
- **`sidebar.tsx`**: Specialized responsive sidebar components.
- **`skeleton.tsx`**: Animated skeleton pulse placeholders for loading states.
- **`slider.tsx`**: Range slider input primitive.
- **`sonner.tsx`**: Lightweight toast notification container.
- **`toggle.tsx`**: Two-state toggle button.
- **`toggle-group.tsx`**: Group container for multiple toggle buttons.
- **`use-mobile.ts`**: React custom hook detecting viewport dimensions below mobile breakpoints.
- **`utils.ts`**: Exported `cn()` utility combining `clsx` and `tailwind-merge` to safely combine conditional CSS classes.

---

## 7. Service Layer & API Clients (`src/app/services/`)

- **`src/app/services/apiService.ts`**:
  - The central API engine of the frontend containing all TypeScript interfaces and 60+ async REST functions.
  - **`getBaseUrl()`**: Automatically determines backend URL, using relative routing in development to eliminate CORS errors and ngrok warning screens.
  - **`fetchWithAuth()`**: Injects Bearer tokens and handles automatic 401 refresh retries using HttpOnly cookies.
  - **Authentication Endpoints**: `adminLogin()`, `adminRefresh()`, `adminGetMe()`, `adminLogout()`.
  - **Video Endpoints**: `getVideos()`, `getVideoDetails()`, `initiateVideoUpload()`, `updateVideo()`, `deleteVideo()`, `bulkDeleteVideos()`, `publishVideo()`, `unpublishVideo()`, `scheduleVideo()`, `uploadThumbnail()`, `selectMainThumbnail()`, `deleteThumbnail()`.
  - **Playlist Endpoints**: `getPlaylists()`, `createPlaylist()`, `updatePlaylist()`, `deletePlaylist()`, `uploadPlaylistBanner()`, `getPlaylistVideos()`, `addVideosToPlaylist()`, `removeVideoFromPlaylist()`, `reorderPlaylistVideos()`.
  - **Subscriber Endpoints**: `getSubscribers()`.
  - **Plan Endpoints**: `getSubscriptionPlans()`, `updateSubscriptionPlan()`, `toggleSubscriptionPlanActive()`, `reorderSubscriptionPlans()`.
  - **Dashboard & Analytics Endpoints**: `getDashboardStats()`, `getDashboardAnalytics()`, `getDashboardSubscriptionBreakdown()`, `getDashboardRecentActivity()`.
  - **Monetization Endpoints**: `getMonetizationSummary()`, `getMonetizationAnalytics()`, `getMonetizationSettlements()`, `getPayoutSettings()`, `updatePayoutSettings()`.
  - **Community Endpoints**: `getAdminComments()`, `postCommentReply()`, `toggleCommentLike()`, `deleteComment()`.
  - **Branding Endpoints**: `getCreatorBranding()`, `updateCreatorBranding()`, `uploadCreatorLogo()`, `uploadCreatorBanner()`, `getFeaturedVideos()`, `addFeaturedVideos()`, `reorderFeaturedVideos()`, `deleteFeaturedVideo()`.
  - **Category Endpoints**: `getCategories()`, `createCategory()`, `updateCategory()`, `uploadCategoryThumbnail()`, `reorderCategories()`, `deleteCategory()`.
  - **Profile Endpoints**: `getCreatorProfile()`, `updateCreatorProfile()`, `uploadAvatarPhoto()`.
- **`src/app/services/apiMonitorService.ts`**:
  - Event telemetry collector that hooks into fetch events to record endpoint URLs, request methods, response statuses, and round-trip latencies for `ApiResponseMonitor`.

---

## 8. Stylesheets & Theme Definitions (`src/styles/`)

- **`src/styles/globals.css`**:
  - Root stylesheet importing Tailwind CSS directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
  - Defines CSS custom variables for root colors, light mode background tones, borders, and input focus rings.
  - Configures global typography resets and sleek scrollbar dimensions.
- **`src/styles/tailwind.css`**:
  - Custom Tailwind utility extensions, animation keyframes, and Bress card styling.
- **`src/styles/theme.css`**:
  - Design system color tokens, shadow definitions, and border-radius variables.
- **`src/styles/fonts.css`**:
  - Typography declarations configuring the system font stack and Inter fallback rules.
- **`src/styles/index.css`**:
  - Base CSS normalization stylesheet.
