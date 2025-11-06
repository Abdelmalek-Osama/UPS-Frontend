# Quick Reference Guide - Feature-Based Architecture

## Feature Structure Template

When creating a new feature, follow this structure:

```
feature-name/
├── components/        # React components
│   ├── FeatureName.tsx           # Main component
│   └── FeatureSubComponent.tsx   # Sub-components
├── hooks/            # Custom hooks
│   └── useFeatureData.ts
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions (optional)
│   └── helpers.ts
└── index.ts          # Public API
```

## Index.ts Pattern

Every feature should export its public API:

```typescript
// src/features/feature-name/index.ts
export { FeatureName } from './components/FeatureName';
export { useFeatureData } from './hooks/useFeatureData';
export type * from './types';
```

## Import Patterns

### Feature Imports
```typescript
// ✅ Good - Import from feature index
import { DashboardHome, useDashboardData } from '@/features/dashboard';
import type { User } from '@/features/auth';

// ❌ Bad - Don't import from internal paths
import { DashboardHome } from '@/features/dashboard/components/DashboardHome';
```

### Shared Utilities
```typescript
import { formatDate } from '@/shared/utils';
```

### UI Components
```typescript
import { Button } from '@/components/ui/button';
```

## Type Definitions

### Component Props
```typescript
// In types/index.ts
export interface FeatureData {
  id: number;
  name: string;
  // ...
}

export interface FeatureFilters {
  searchTerm: string;
  category: string;
}
```

### Component
```typescript
// In components/Feature.tsx
import type { FeatureData } from '../types';

interface FeatureProps {
  data: FeatureData[];
  onUpdate: (id: number) => void;
}

export function Feature({ data, onUpdate }: FeatureProps) {
  // Component code
}
```

## Custom Hooks Pattern

```typescript
// hooks/useFeatureData.ts
import { useState } from 'react';
import type { FeatureData } from '../types';

export function useFeatureData() {
  const [data, setData] = useState<FeatureData[]>([]);
  
  // Logic here
  
  return {
    data,
    setData,
    // ... other exports
  };
}
```

## Utility Functions

```typescript
// utils/helpers.ts
export function calculateSomething(value: number): number {
  return value * 2;
}

export function formatSomething(text: string): string {
  return text.toUpperCase();
}
```

## Component Organization

### Main Component Structure
```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { useFeatureData } from '../hooks/useFeatureData';
import type { FeatureData } from '../types';

export function FeatureName() {
  // Hooks
  const { data } = useFeatureData();
  const [localState, setLocalState] = useState('');
  
  // Event handlers
  const handleAction = () => {
    // Logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Testing Structure

```
feature-name/
├── components/
│   └── __tests__/
│       └── FeatureName.test.tsx
├── hooks/
│   └── __tests__/
│       └── useFeatureData.test.ts
└── utils/
    └── __tests__/
        └── helpers.test.ts
```

## Common Patterns

### Data Fetching Hook
```typescript
export function useFeatureData() {
  const [data, setData] = useState<FeatureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Fetch data
  }, []);
  
  return { data, loading, error };
}
```

### Filter Hook
```typescript
export function useFilteredData(
  data: FeatureData[], 
  filters: FeatureFilters
) {
  return data.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());
    const matchesCategory = 
      filters.category === 'all' || 
      item.category === filters.category;
    return matchesSearch && matchesCategory;
  });
}
```

### Dialog/Modal Component
```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: FeatureData;
}

export function FeatureDialog({ 
  open, 
  onOpenChange, 
  data 
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog content */}
    </Dialog>
  );
}
```

## File Naming Conventions

- **Components**: PascalCase - `FeatureName.tsx`
- **Hooks**: camelCase with 'use' prefix - `useFeatureData.ts`
- **Types**: PascalCase - `index.ts` (exports interfaces/types)
- **Utils**: camelCase - `helpers.ts`, `formatters.ts`

## Checklist for New Features

- [ ] Create feature directory under `src/features/`
- [ ] Add `components/` folder with main component
- [ ] Add `types/` folder with type definitions
- [ ] Add `hooks/` folder if needed
- [ ] Add `utils/` folder if needed
- [ ] Create `index.ts` with public exports
- [ ] Import feature in `DashboardLayout.tsx`
- [ ] Add navigation menu item
- [ ] Update route handling
- [ ] Add tests
- [ ] Update documentation

## Quick Tips

1. **Keep features independent** - Avoid importing between features
2. **Use shared utilities** - Put common code in `shared/`
3. **Export selectively** - Only export what's needed from `index.ts`
4. **Type everything** - Use TypeScript interfaces for all data
5. **Consistent naming** - Follow naming conventions
6. **Document types** - Add JSDoc comments to complex types
7. **Keep components small** - Break down large components
8. **Custom hooks for logic** - Extract business logic to hooks
