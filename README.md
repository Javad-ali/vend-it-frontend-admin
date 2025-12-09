# 🎯 Vend-IT Admin Dashboard

A modern, feature-rich admin dashboard for managing the Vend-IT vending machine platform. Built with Next.js, TypeScript, Redux Toolkit, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 📊 **Dashboard Analytics**
- Revenue trend charts (line chart)
- Orders timeline (area chart)
- User growth analysis (bar chart)
- Machine status distribution (pie chart)

### 👥 **User Management**
- Pagination with configurable rows per page
- Advanced filtering (status, search)
- Bulk selection and delete
- CSV/Excel export
- Suspend/unsuspend users

### 🤖 **Machine Management**
- Status filtering (Active, Inactive, Maintenance)
- QR code regeneration
- Location tracking
- Export capabilities

### 📦 **Product Management**
- Category filtering
- Search by ID, description, brand
- Export functionality

### 🛒 **Order Management**
- Status filtering (Pending, Completed, Cancelled, Refunded)
- Formatted currency and dates
- Customer search
- Export orders

### 🎯 **Campaign Management**
- Create/Edit/Delete campaigns
- Image upload with preview
- Date range selection
- Export campaigns

### 🏷️ **Category Management**
- Icon upload for categories
- CRUD operations
- Export to CSV

### 💬 **Feedback Management**
- Rating filter (1-5 stars)
- Star visualization
- Export feedback

### 📄 **Content Management**
- Manage About Us
- Terms & Conditions
- Privacy Policy

### 👤 **Profile Management**
- Update admin information
- Avatar upload with preview

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:4000` (or configure in `.env`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vend-IT-frontend-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # 20+ reusable UI components
│   │   ├── pagination.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── table-skeleton.tsx
│   │   ├── image-upload.tsx
│   │   └── ...
│   ├── dashboard/          # Chart components
│   │   ├── RevenueChart.tsx
│   │   ├── OrdersChart.tsx
│   │   ├── UserGrowthChart.tsx
│   │   └── MachineStatusChart.tsx
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ErrorBoundary.tsx
├── hooks/                  # Custom React hooks
│   ├── usePagination.ts
│   ├── useFilters.ts
│   └── useBulkSelection.ts
├── lib/
│   ├── api.ts             # Axios instance
│   ├── export.ts          # CSV/Excel utilities
│   └── utils.ts           # Helper functions
├── store/
│   ├── api/
│   │   └── adminApi.ts    # RTK Query API
│   ├── slices/
│   │   └── authSlice.ts
│   └── index.ts
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── dashboard.tsx
│   ├── users/
│   ├── machines/
│   ├── products/
│   ├── orders/
│   ├── campaigns/
│   ├── categories/
│   ├── feedback.tsx
│   ├── content.tsx
│   └── profile.tsx
└── types/
    └── index.ts
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (Pages Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **State Management** | Redux Toolkit, RTK Query |
| **UI Components** | shadcn/ui, Radix UI |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Recharts |
| **Forms** | React Hook Form |
| **Notifications** | Sonner |
| **Export** | xlsx, custom CSV utility |
| **Date Handling** | date-fns, react-day-picker |

---

## 📦 Key Dependencies

```json
{
  "next": "16.0.7",
  "react": "^19.0.0",
  "@reduxjs/toolkit": "^2.5.0",
  "recharts": "^2.15.0",
  "xlsx": "^0.18.5",
  "react-day-picker": "^9.4.3",
  "tailwindcss": "^4.0.0"
}
```

---

## 🎨 Component Library

### Core Components Created

- **Pagination** - Full-featured with page navigation and items per page
- **Confirm Dialog** - Async confirmation modals
- **Table Skeleton** - Loading states for tables
- **Card Skeleton** - Loading states for cards
- **Date Range Picker** - Date filtering
- **Image Upload** - Drag & drop with preview and validation

### Custom Hooks

- **`usePagination(initialLimit)`** - Pagination state management
- **`useFilters()`** - Filter state with search, status, date range
- **`useBulkSelection<T>()`** - Bulk item selection logic

### Utility Functions

- **`formatCurrency(amount)`** - Format KWD currency
- **`formatDate(date)`** - User-friendly date formatting
- **`exportToCSV(data, filename, columns)`** - Export to CSV
- **`exportToExcel(data, filename, sheetName, columns)`** - Export to Excel
- **`debounce(fn, delay)`** - Function debouncing
- **`getStatusVariant(status)`** - Badge variant by status

---

## 🔐 Authentication

The app uses JWT token-based authentication:

1. Login at `/login` with admin credentials
2. Token stored in localStorage as `adminToken`
3. Auto-redirect to `/login` on 401 responses
4. Protected routes wrapped with `ProtectedRoute` component

---

## 📊 API Integration

All API calls use **RTK Query** for efficient data fetching and caching.

### Example Endpoint

```typescript
// src/store/api/adminApi.ts
export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('adminToken')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query({ query: () => '/admin/users' }),
    deleteUser: builder.mutation({ query: (id) => ({
      url: `/admin/users/${id}`,
      method: 'DELETE'
    })})
  })
})
```

---

## 🧪 Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

---

## 🎯 Features by Page

| Page | Features |
|------|----------|
| **Dashboard** | 4 charts, metrics cards, skeleton loaders |
| **Users** | Pagination, filters, bulk delete, export |
| **Machines** | Pagination, status filter, QR regen, export |
| **Products** | Pagination, category filter, export |
| **Orders** | Pagination, status filter, formatted data, export |
| **Campaigns** | CRUD, image upload, date pickers, export |
| **Categories** | CRUD, icon upload, export |
| **Feedback** | Pagination, rating filter, star display, export |
| **Content** | Manage static content (About, Terms, Privacy) |
| **Profile** | Update admin info, avatar upload |

---

## 🚀 Usage Examples

### Pagination

```typescript
import { usePagination } from '@/hooks/usePagination'

const pagination = usePagination(10) // 10 items per page

<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  onPageChange={pagination.setPage}
  itemsPerPage={pagination.limit}
  onItemsPerPageChange={pagination.setLimit}
/>
```

### Export Data

```typescript
import { exportToCSV } from '@/lib/export'

exportToCSV(users, 'users.csv', [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', format: (v) => v === 1 ? 'Active' : 'Suspended' }
])
```

### Bulk Selection

```typescript
import { useBulkSelection } from '@/hooks/useBulkSelection'

const selection = useBulkSelection<User>()

selection.toggle(userId)
selection.toggleAll(users, (user) => user.id)
```

---

## 🐛 Error Handling

Global error boundary wraps the entire app:

```typescript
// src/pages/_app.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary>
  <Provider store={store}>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </Provider>
</ErrorBoundary>
```

---

## 📄 License

MIT

---

## 👨‍💻 Development

Built with ❤️ using modern web technologies.

For issues or feature requests, please contact the development team.

**Happy coding!** 🚀
