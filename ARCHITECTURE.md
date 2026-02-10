# 🏗️ Architecture & Structure

## 📂 File Structure

```
app/
├── globals.css          # Global styles & Theme variables
├── layout.tsx           # Root app layout (metadata, fonts)
└── page.tsx             # MAIN ROUTER: Handles state-based navigation

components/
├── pages/               # Full Page Components
│   ├── AdminPage.jsx
│   ├── DMPage.jsx
│   ├── FederationPage.jsx
│   ├── HomePage.jsx
│   ├── InstancePage.jsx
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── ModerationPage.jsx
│   ├── ProfilePage.jsx
│   ├── SecurityPage.jsx
│   ├── SignupPage.jsx
│   └── ThreadPage.jsx
│
├── styles/              # Component-specific CSS
│   └── [PageName].css
│
└── ui/                  # Reusable UI widgets
    └── (Buttons, Cards, Inputs, etc.)

lib/
├── api.ts               # API Client (Fetch wrappers for backend)
├── crypto.ts            # Client-side crypto (Key gen, DID signing)
└── utils.ts             # Helper functions (DateFormatting, etc.)
```

## 🧩 Key Concepts

### 1. State-Based Routing
Unlike traditional Next.js routing, this app operates as a true Single Page Application (SPA) where `app/page.tsx` holds the `currentPage` state. This facilitates smoother transitions and state persistence during the prototype phase.

### 2. Client-Side Cryptography (`lib/crypto.ts`)
Users generate keys **in the browser**. Private keys are stored in `localStorage` (for demo purposes) and never sent to the server in plain text, except for the public key which forms the DID.

### 3. API Layer (`lib/api.ts`)
Centralized API handling. Includes:
- JWT Token management (Auto-attach `Authorization` headers)
- Error handling (Unified error parsing)
- Endpoints for Auth, Users, Posts, and Admin functions.

## 🎨 Theme Architecture
Styles are decentralized but share a common "token" set in `styles/theme.css`.
- **Primary**: Cyan `#00d9ff`
- **Secondary**: Magenta `#ff006e`
- **Background**: Dark Navy `#0f0f1a`

Dark mode is enforced by default via CSS variables.
