# Admin Frontend Project Structure

This document describes the folder structure and setup for the Vend-IT Admin Frontend.

## Directory Structure

```
src/
├── components/
│   ├── ui/                    # shadcn components (auto-generated)
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   └── layout/
│       ├── Layout.tsx         # Main layout wrapper
│       ├── Sidebar.tsx        # Navigation sidebar
│       └── Header.tsx         # Top header with user info
├── contexts/
│   └── AuthContext.tsx        # Authentication context provider
├── lib/
│   ├── api.ts                 # API client utilities
│   └── utils.ts               # General utilities
├── pages/
│   ├── _app.tsx               # Next.js app wrapper with AuthProvider
│   ├── _document.tsx          # Next.js document
│   ├── index.tsx              # Landing page
│   ├── login.tsx              # Login page
│   ├── dashboard.tsx          # Main dashboard
│   ├── users/
│   │   └── index.tsx          # User management page
│   ├── machines/
│   │   └── index.tsx          # Machine management page
│   ├── products/
│   │   └── index.tsx          # Product management page
│   ├── orders/
│   │   └── index.tsx          # Order management page
│   ├── campaigns/
│   │   └── index.tsx          # Campaign management page
│   ├── categories/
│   │   └── index.tsx          # Category management page
│   ├── feedback.tsx           # Feedback management
│   ├── content.tsx            # Content management
│   ├── profile.tsx            # User profile
│   └── change-password.tsx    # Password change page
└── types/
    └── index.ts               # TypeScript type definitions
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-secret-key-here

# Environment
NODE_ENV=development
```

## Key Components

### Layout Components
- **Layout.tsx**: Main wrapper component that includes Sidebar and Header
- **Sidebar.tsx**: Navigation menu with links to all admin sections
- **Header.tsx**: Top bar with user info and logout functionality

### Context
- **AuthContext.tsx**: Manages authentication state, login, logout, and token storage

### API Client
- **api.ts**: Centralized API client with methods for GET, POST, PUT, DELETE, and PATCH requests

### Types
- **types/index.ts**: TypeScript interfaces for all entities (User, Machine, Product, Order, Campaign, Category, Feedback, Content)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your `.env.local` file with the environment variables listed above

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Next Steps

- Implement actual API endpoints in the backend
- Add authentication logic to match your backend API
- Create detailed CRUD interfaces for each entity
- Add data tables with pagination, sorting, and filtering
- Implement form validation
- Add error handling and loading states
- Integrate with your actual API endpoints
