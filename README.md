# 🌐 SPLITTER - Decentralized Social Network Frontend

A modern, privacy-first social network interface built with **Next.js 16**, **Tailwind CSS**, and **Shadcn/UI**. It demonstrates federated identity concepts using local cryptography (DIDs) without requiring a complex backend for the initial prototype.

## 📋 Project Overview

This is a **Single Page Application (SPA)** architecture hosted within the Next.js App Router. It features **12 fully functional pages** including a complete authentication flow, social feed, direct messaging, and admin tools.

### 🔑 Key Features
*   **Decentralized Identity (DID)**: Users generate keys in-browser; private keys never leave the device.
*   **Federation Simulation**: Browse and "connect" to different server instances.
*   **Light & Dark Mode**: Smooth peach light theme and neon-accented dark theme with toggle support.
*   **Mock Backend**: Runs entirely in the browser with local state, but includes API hooks for a real Go backend.

## 🛠️ Technology Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI + Tailwind)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State**: Local React State + Context

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   npm or pnpm

### Installation
```bash
git clone https://github.com/your-repo/splitter-frontend.git
cd splitter-frontend
npm install
```

### Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000` to start the experience.

## 🧭 Page Map

| Page | Description |
|---|---|
| **Landing** | Concept introduction & "Get Started" flow |
| **Instances** | Visual server browser with reputation metrics |
| **Signup** | Cryptographic identity generation (4-step wizard) |
| **Login** | Challenge-response authentication |
| **Home** | The main timeline with posting, liking, and replies |
| **Profile** | User profiles with tabs for posts, media, and network |
| **Thread** | Detailed post view with threaded replies |
| **DM** | E2E Encrypted mock messaging interface |
| **Security** | Manage your keys and recovery phrases |
| **Moderation** | Content moderation queue and filters |
| **Federation** | Server health metrics and federation status |
| **Admin** | Server administration tools (role-guarded) |

## 🎨 Customization

The design system is built on **Tailwind CSS** with light/dark mode support.
*   **Theme**: Edit `app/globals.css` to change CSS variables for colors. Both light and dark themes are fully customizable.
*   **Components**: Reusable UI components are located in `components/ui`.

## 🤝 Contributing

This is a prototype for the **Splitter** network. Contributions to connect this frontend to real ActivityPub backends are welcome!

## 📄 License

MIT License.
