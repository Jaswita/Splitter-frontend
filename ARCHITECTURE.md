# 🏗️ Architecture & Structure

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript / React 19
*   **Styling**: Tailwind CSS + Shadcn/UI Component Library
*   **State Management**: React `useState`/`useEffect` (Local State)
*   **Icons**: Lucide React
*   **Build Tool**: PostCSS / Autoprefixer

## 📂 File Structure

```
app/
├── globals.css          # Global styles & Tailwind directives
├── layout.tsx           # Root app layout (metadata, fonts, ThemeProvider)
└── page.tsx             # MAIN ENTRY: Handles "SPA-like" internal routing

components/
├── pages/               # Feature Pages (Lazy loaded in page.tsx)
│   ├── AdminPage.tsx
│   ├── DMPage.tsx
│   ├── FederationPage.tsx
│   ├── HomePage.tsx
│   ├── InstancePage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── ModerationPage.tsx
│   ├── ProfilePage.tsx
│   ├── SecurityPage.tsx
│   ├── SignupPage.tsx
│   └── ThreadPage.tsx
│
├── ui/                  # Shadcn UI Components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ... (reusable atoms)
│
└── theme-provider.tsx   # Next-themes wrapper

lib/
├── api.ts               # API Client (Fetch wrappers for backend)
├── crypto.ts            # Client-side crypto (Key gen, DID signing)
└── utils.ts             # CN helper for Tailwind class merging
```

## 🧩 Key Architecture Concepts

### 1. Hybrid SPA Routing
While built on Next.js App Router, this application currently operates as a **Single Page Application (SPA)** where `app/page.tsx` manages a local `currentPage` state variable.
*   **Why?** Rapid prototyping of a complex stateful flow without full server-side routing implementation yet.
*   **Mechanism**: `page.tsx` conditionally renders components from `components/pages/` based on `currentPage`.

### 2. Client-Side Cryptography
User identity is based on **Decentralized Identifiers (DIDs)**.
*   Keys are generated in the browser using WebCrypto API.
*   Private keys are stored in `localStorage` for the prototype.
*   **Security Note**: In a production environment, this would move to a secure enclave or wallet extension.

### 3. API & Backend Integration (`lib/api.ts`)
The frontend communicates with a Go backend (typically on port 8080).
*   **Health Checks**: `healthApi.check()` verifies backend connectivity on mount.
*   **Authentication**: JWT tokens are stored in `localStorage` and attached to requests via `Authorization: Bearer <token>`.
*   **Mock Fallback**: The app includes UI states for when the backend is disconnected.

## 🎨 Theme System
Theming is handled by `next-themes` and Tailwind CSS with full light/dark mode support.
*   **Light Mode**: Smooth peach palette with teal accents (`:root` in `globals.css`)
*   **Dark Mode**: Charcoal and deep navy with neon cyan/magenta accents (`[data-theme="dark"]`)
*   **Default**: Dark mode is the default theme
*   **Toggle**: Users can switch between themes via the theme provider
*   **Colors**: Configured in `app/globals.css` as CSS variables (`--primary`, `--background`, etc.) which Tailwind maps to utility classes
