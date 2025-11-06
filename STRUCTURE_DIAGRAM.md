# Project Structure Diagram

## Overview

```
UPS-Frontend/
│
├── 📁 src/
│   │
│   ├── 📁 features/                    # Feature modules (organized by domain)
│   │   │
│   │   ├── 📁 dashboard/               # Dashboard feature
│   │   │   ├── 📁 components/
│   │   │   │   └── DashboardHome.tsx
│   │   │   ├── 📁 hooks/
│   │   │   │   └── useDashboardData.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # FlowDataPoint, DashboardStats, etc.
│   │   │   ├── 📁 utils/
│   │   │   └── index.ts               # Public exports
│   │   │
│   │   ├── 📁 sites/                   # Sites management
│   │   │   ├── 📁 components/
│   │   │   │   └── SitesManagement.tsx
│   │   │   ├── 📁 hooks/
│   │   │   │   └── useSitesData.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # Site, SiteFilters
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 users/                   # User management
│   │   │   ├── 📁 components/
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── AddUserDialog.tsx
│   │   │   │   └── ResetPasswordDialog.tsx
│   │   │   ├── 📁 hooks/
│   │   │   │   └── useUsersData.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # User
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 readings/                # Readings management
│   │   │   ├── 📁 components/
│   │   │   │   ├── ReadingsManagement.tsx
│   │   │   │   ├── WaterLevelTable.tsx
│   │   │   │   └── PumpStationTable.tsx
│   │   │   ├── 📁 hooks/
│   │   │   │   └── useReadingsData.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # WaterLevelReading, PumpStationReading
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 alarms/                  # Alarm configuration
│   │   │   ├── 📁 components/
│   │   │   │   └── AlarmConfiguration.tsx
│   │   │   ├── 📁 hooks/
│   │   │   │   └── useAlarmsData.ts
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # ValueThresholdAlarm, CommunicationAlarm
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 flow-calculations/       # Flow calculations
│   │   │   ├── 📁 components/
│   │   │   │   └── FlowCalculations.tsx
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # FormulaParams, HQCurvePoint
│   │   │   ├── 📁 utils/
│   │   │   │   └── flowCalculations.ts # Calculation functions
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 audit-logs/              # Audit logs
│   │   │   ├── 📁 components/
│   │   │   │   └── AuditLogs.tsx
│   │   │   ├── 📁 types/
│   │   │   │   └── index.ts           # AuditLog, AuditLogFilters
│   │   │   ├── 📁 utils/
│   │   │   │   └── formatters.tsx     # Action formatters
│   │   │   └── index.ts
│   │   │
│   │   └── 📁 auth/                    # Authentication
│   │       ├── 📁 components/
│   │       │   └── LoginPage.tsx
│   │       ├── 📁 types/
│   │       │   └── index.ts           # User, LoginCredentials
│   │       └── index.ts
│   │
│   ├── 📁 components/                  # Shared components
│   │   ├── 📁 ui/                      # UI library (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (40+ components)
│   │   ├── 📁 figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── DashboardLayout.tsx         # Layout wrapper
│   │
│   ├── 📁 shared/                      # Shared utilities
│   │   └── 📁 utils/
│   │       ├── formatters.ts          # Date, number formatting
│   │       └── index.ts
│   │
│   ├── 📁 styles/
│   │   └── globals.css
│   │
│   ├── App.tsx                         # Root component
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Global styles
│
├── 📄 ARCHITECTURE.md                  # Architecture documentation
├── 📄 QUICK_REFERENCE.md               # Developer quick reference
├── 📄 RESTRUCTURING_SUMMARY.md         # Migration summary
├── 📄 MIGRATION_CHECKLIST.md           # Migration tasks
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 README.md
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       App.tsx                            │
│  - Authentication state                                  │
│  - Routes to LoginPage or DashboardLayout               │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼──────┐       ┌─────▼─────────────┐
    │ LoginPage  │       │ DashboardLayout   │
    │            │       │  - Navigation     │
    │ (Auth)     │       │  - User info      │
    └────────────┘       │  - Logout         │
                         └─────┬─────────────┘
                               │
            ┌──────────────────┼────────────────────┐
            │                  │                    │
    ┌───────▼────┐    ┌───────▼────┐      ┌───────▼────┐
    │ Dashboard  │    │   Sites    │ ...  │   Users    │
    │            │    │            │      │            │
    │ Feature    │    │  Feature   │      │  Feature   │
    └────────────┘    └────────────┘      └────────────┘
```

## Feature Internal Structure

```
┌─────────────────────────────────────────────┐
│           Feature Module                     │
│  (e.g., dashboard/)                         │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │        index.ts                    │   │
│  │  Public API - Controls exports    │   │
│  └────────────┬───────────────────────┘   │
│               │                             │
│    ┌──────────┼──────────┐                 │
│    │          │          │                 │
│  ┌─▼──┐   ┌──▼──┐   ┌──▼──┐   ┌──────┐  │
│  │Comp│   │Hooks│   │Types│   │Utils │  │
│  │    │   │     │   │     │   │      │  │
│  │tsx │◄──┤ ts  │◄──┤ ts  │   │ ts   │  │
│  └────┘   └─────┘   └─────┘   └──────┘  │
│    ▲                                      │
│    │                                      │
│    │ Uses UI components from             │
│    └──────────────────────────────────┐  │
└───────────────────────────────────────┼──┘
                                        │
                                   ┌────▼────┐
                                   │components│
                                   │   /ui/   │
                                   └──────────┘
```

## Import Flow

```
App.tsx
  │
  ├─► features/auth          (LoginPage, User type)
  │
  └─► components/DashboardLayout
        │
        ├─► features/dashboard       (DashboardHome)
        ├─► features/sites          (SitesManagement)
        ├─► features/users          (UserManagement)
        ├─► features/readings       (ReadingsManagement)
        ├─► features/alarms         (AlarmConfiguration)
        ├─► features/flow-calculations (FlowCalculations)
        └─► features/audit-logs     (AuditLogs)

Each feature internally uses:
  ├─► Own components
  ├─► Own hooks
  ├─► Own types
  ├─► Own utils (if any)
  ├─► components/ui/*  (UI library)
  └─► shared/utils/*   (Shared utilities)
```

## Key Principles

### 1. **Feature Independence**
Each feature is self-contained and can work independently.

### 2. **Clear Boundaries**
```
✅ features/dashboard → components/ui/button
✅ features/dashboard → shared/utils
❌ features/dashboard → features/sites  (Avoid cross-feature imports)
```

### 3. **Public API**
Each feature exports only what's needed:
```typescript
// features/dashboard/index.ts
export { DashboardHome } from './components/DashboardHome';
export { useDashboardData } from './hooks/useDashboardData';
export type * from './types';

// Internal implementation details are NOT exported
```

### 4. **Type Safety**
All data structures have TypeScript interfaces:
```
Feature Types → Components → UI
```

### 5. **Reusability**
Common code lives in `shared/`:
```typescript
// ✅ Shared utilities
shared/utils/formatters.ts

// ✅ UI components
components/ui/*

// ❌ Feature-specific code doesn't go in shared
```

## Benefits Visualization

```
Before (Component-based):
components/
  ├── DashboardHome.tsx  (600+ lines, mixed concerns)
  ├── SitesManagement.tsx (400+ lines, mixed concerns)
  └── ... (all components in one folder)

After (Feature-based):
features/
  ├── dashboard/
  │   ├── components/DashboardHome.tsx  (100 lines, focused)
  │   ├── hooks/useDashboardData.ts     (Clean, testable)
  │   └── types/index.ts                (Type-safe)
  └── sites/
      ├── components/SitesManagement.tsx (80 lines, focused)
      ├── hooks/useSitesData.ts          (Clean, testable)
      └── types/index.ts                 (Type-safe)
```

## Summary

The new structure provides:

✅ **Better Organization** - Code grouped by feature
✅ **Improved Maintainability** - Easy to locate and modify
✅ **Clear Separation** - Each feature has clear boundaries
✅ **Type Safety** - Comprehensive TypeScript types
✅ **Reusability** - Shared code is explicit
✅ **Scalability** - Easy to add new features
✅ **Testability** - Hooks and utils are easily testable
