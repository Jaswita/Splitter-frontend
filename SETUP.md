# Splitter - Setup & Installation Guide

## Overview

Splitter is a decentralized social networking frontend built with **Next.js 16**, **Tailwind CSS**, and **Shadcn/UI**. It features a privacy-first identity management system using local cryptography (DIDs) and a federated architecture simulation.

---

## 🛠️ Prerequisites

*   **Node.js**: 18.17.0 or higher
*   **Package Manager**: `npm` (8.x+) or `pnpm` (8.x+)
*   **Backend**: (Optional) A split-server instance running on port 8080 for full functionality.

---

## 📂 Project Structure

```
splitter-frontend/
├── app/
│   ├── layout.tsx         # Root layout (Metadata, Fonts, Providers)
│   ├── page.tsx           # Main App Controller (SPA Routing Logic)
│   └── globals.css        # Tailwind directives & CSS variables
│
├── components/
│   ├── pages/             # Logic-heavy page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── ... (12 pages total)
│   │
│   └── ui/                # Shadcn/UI Design System
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/
│   ├── api.ts             # API client & error handling
│   ├── crypto.ts          # Cryptographic operations
│   └── utils.ts           # Utility functions (cn, formatting)
│
├── public/                # Static assets
└── package.json           # Dependencies & Scripts
```

---

## 🚀 Installation & Running

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/splitter-frontend.git
cd splitter-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Navigation Flow

Although built with Next.js, this app currently uses a **single-route SPA architecture**. The main entry point `app/page.tsx` handles valid views based on local state.

| Page | Description |
|---|---|
| **Landing** | Introduction & Federation Explainer |
| **Instances** | Server discovery & selection |
| **Signup** | DID generation & Identity creation |
| **Login** | Challenge-Response Authentication |
| **Home** | Main feed, posting, and trends |
| **Profile** | User details, posts, and network |
| **Thread** | Detailed post view with replies |
| **DM** | Direct messaging (Mocked/Encrypted) |
| **Security** | Key management dashboard |
| **Moderation** | Content moderation panel |
| **Federation** | Federation health & server metrics |
| **Admin** | Server administration (Role guarded) |

---

## ⚙️ Configuration

### Environment Variables
While the app defaults to localhost, you can configure the backend URL if needed (future implementation):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend Connection
The app attempts to connect to a backend at startup.
*   **Connected**: Full functionality enabled.
*   **Disconnected**: Shows a "Backend not connected" banner, but UI remains explorable in limited mode.

---

## 🎨 Customization

### Theme Colors
The app uses **Tailwind CSS** variables for theming with full light/dark mode support, located in `app/globals.css`.

**Light Mode** (Smooth Peach):
*   `--primary`: #0f7c7b (Teal)
*   `--background`: #fff0e6 (Peach)
*   `--accent`: #ff9a8b (Coral)

**Dark Mode** (Default):
*   `--primary`: #00d9ff (Cyan)
*   `--background`: #0f0f1a (Deep Navy)
*   `--accent`: #ff006e (Magenta)

### UI Components
UI elements are built with **Shadcn/UI**. You can customize individual components in `components/ui/*.tsx`.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```
This generates a static/hybrid Next.js application in the `.next` folder.

