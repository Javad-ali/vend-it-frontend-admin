# Test Suite

This folder contains all tests for the Vend-IT Admin Dashboard.

## Structure

```
tests/
├── setup/           # Test utilities and mocks
│   ├── test-utils.tsx
│   └── mocks.ts
├── hooks/           # Hook tests
├── lib/             # Utility function tests
├── components/      # Component tests
└── pages/           # Page integration tests
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Test Files

- **Hooks**: usePagination, useBulkSelection
- **Utils**: formatCurrency, formatDate, debounce, getStatusVariant
- **Components**: Pagination, ConfirmDialog
- **Pages**: Dashboard, Activity Logs

## Coverage Goal

Target: 75% overall coverage
- Functions: 70%+
- Lines: 75%+
- Branches: 70%+
