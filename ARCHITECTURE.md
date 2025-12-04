# Feature-Based Architecture

This project follows a feature-based architecture where code is organized by features rather than by technical layers.

## Directory Structure

```
src/
├── features/              # Feature modules
│   ├── dashboard/         # Dashboard feature
│   │   ├── components/    # Dashboard-specific components
│   │   ├── hooks/         # Dashboard-specific hooks
│   │   ├── types/         # Dashboard-specific types
│   │   ├── utils/         # Dashboard-specific utilities
│   │   └── index.ts       # Public API exports
│   ├── sites/             # Sites management feature
│   ├── users/             # User management feature
│   ├── readings/          # Readings management feature
│   ├── alarms/            # Alarm configuration feature
│   ├── flow-calculations/ # Flow calculations feature
│   ├── audit-logs/        # Audit logs feature
│   └── auth/              # Authentication feature
├── components/            # Shared/Layout components
│   ├── ui/                # UI component library (shadcn/ui)
│   └── DashboardLayout.tsx
├── shared/                # Shared utilities
│   └── utils/             # Common utilities
└── App.tsx                # Root application component
```

## Benefits

1. **Better Organization**: Related code is grouped together
2. **Improved Maintainability**: Easy to locate and modify feature-specific code
3. **Scalability**: New features can be added without affecting existing ones
4. **Clear Boundaries**: Each feature is self-contained with its own types, hooks, and components
5. **Reusability**: Shared code is explicitly placed in the `shared/` folder

## Feature Structure

Each feature follows this pattern:

```
feature-name/
├── components/     # React components for this feature
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Feature-specific utility functions
└── index.ts        # Public API - exports only what's needed externally
```

## Import Examples

```typescript
// Import from a feature
import { DashboardHome, useDashboardData } from '@/features/dashboard';
import { SitesManagement } from '@/features/sites';
import type { User } from '@/features/auth';

// Import shared utilities
import { formatDate } from '@/shared/utils';

// Import UI components
import { Button } from '@/components/ui/button';
```

## Guidelines

- Keep feature code self-contained
- Export only the public API through `index.ts`
- Use TypeScript types extensively
- Place shared code in `shared/` directory
- UI components from shadcn/ui remain in `components/ui/`
