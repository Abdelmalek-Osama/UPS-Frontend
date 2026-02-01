# I18N Quick Reference

## Quick Start

### Using Translations in Your Component

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

## Key Translation Paths

### Common Actions
- `t('common.save')` → Save
- `t('common.cancel')` → Cancel
- `t('common.delete')` → Delete
- `t('common.edit')` → Edit
- `t('common.add')` → Add
- `t('common.loading')` → Loading...

### Authentication
- `t('auth.login')` → Login
- `t('auth.logout')` → Logout
- `t('auth.email')` → Email
- `t('auth.password')` → Password

### Dashboard
- `t('dashboard.title')` → Main Dashboard
- `t('dashboard.totalSites')` → Total Sites
- `t('dashboard.activeAlarms')` → Active Alarms

### Sites
- `t('sites.title')` → Sites Management
- `t('sites.siteName')` → Site Name
- `t('sites.siteType')` → Site Type

### Alarms
- `t('alarms.title')` → Alarm Configuration
- `t('alarms.addThresholdAlarm')` → Add Threshold Alarm
- `t('alarms.addCommunicationAlarm')` → Add Communication Alarm

### Navigation
- `t('navigation.dashboard')` → Dashboard
- `t('navigation.sites')` → Sites Management
- `t('navigation.readings')` → Readings
- `t('navigation.alarms')` → Alarm Configuration
- `t('navigation.users')` → User Management

## Converting a Component - Step by Step

### Before (Hardcoded):
```tsx
export function Header() {
  return (
    <header dir="rtl">
      <h1>نظام مراقبة الري</h1>
      <button>تسجيل الخروج</button>
    </header>
  );
}
```

### After (i18n):
```tsx
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  
  return (
    <header dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <h1>{t('auth.loginTitle')}</h1>
      <button>{t('auth.logout')}</button>
    </header>
  );
}
```

## Translation File Structure

```json
{
  "_rtl": "rtl",  // "ltr" for English
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "auth": {
    "login": "تسجيل الدخول"
  }
}
```

## Language Switching

The Language Switcher component is already integrated into DashboardLayout. It appears in the top header.

To test:
1. Look for the language dropdown in the header
2. Select "English" or "العربية"
3. Entire UI changes instantly
4. Choice is saved to localStorage

## Common Patterns

### Error Messages
```tsx
const { t } = useTranslation();
// Use: t('errors.loadingFailed')
```

### Loading States
```tsx
// Use: t('common.loading')
```

### Form Labels
```tsx
// Use: t('sites.siteName')
```

### Button Text
```tsx
// Use: t('common.save'), t('common.cancel'), t('common.delete')
```

### Validation Messages
```tsx
// Use: t('validation.required'), t('validation.email')
```

## Important Files

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18n initialization and config |
| `src/i18n/locales/ar.json` | Arabic translations |
| `src/i18n/locales/en.json` | English translations |
| `src/components/LanguageSwitcher.tsx` | Language switcher component |

## Adding New Translation Keys

1. Add key to both `ar.json` and `en.json`:
```json
{
  "myFeature": {
    "title": "Arabic text" // in ar.json
    "title": "English text" // in en.json
  }
}
```

2. Use in component:
```tsx
{t('myFeature.title')}
```

## Testing Checklist

- [ ] Language switcher works (Arabic ↔ English)
- [ ] Text changes when language changes
- [ ] Direction changes (RTL for Arabic, LTR for English)
- [ ] Layout mirrors correctly
- [ ] Language persists after page refresh
- [ ] All pages work in both languages
- [ ] Mobile responsive for RTL/LTR

## Debugging

### View Current Language
```tsx
const { i18n } = useTranslation();
console.log(i18n.language); // "ar" or "en"
```

### Check localStorage
```javascript
localStorage.getItem('language'); // Returns current language
```

### Force Language Change
```tsx
const { i18n } = useTranslation();
i18n.changeLanguage('ar'); // or 'en'
```

---

**Remember:** Every visible text should use `t()` - no hardcoded Arabic or English!
