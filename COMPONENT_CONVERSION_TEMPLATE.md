# Component Conversion Template

Use this template to quickly convert any remaining components to use i18n.

## Template Structure

```tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS
import { SomeComponent } from '../../components/ui/SomeComponent';
// ... other imports

export function MyFeatureComponent() {
  const { t } = useTranslation(); // ADD THIS
  
  // ... component logic
  
  return (
    <div dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}> {/* ADD RTL/LTR SUPPORT */}
      {/* Replace all hardcoded text with t('key.path') */}
    </div>
  );
}
```

## Step-by-Step Conversion Process

### Step 1: Add Import
```tsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Initialize Hook
```tsx
const { t } = useTranslation();
```

### Step 3: Add Direction Support to Root Element
```tsx
<div dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
  {/* Rest of component */}
</div>
```

### Step 4: Replace Hardcoded Text

**BEFORE:**
```tsx
<h2>إدارة المواقع</h2>
<p>البحث عن موقع...</p>
<Label>الموقع</Label>
<Button>حفظ</Button>
<p className="text-red-600">{error}</p>
```

**AFTER:**
```tsx
<h2>{t('sites.title')}</h2>
<p>{t('sites.searchPlaceholder')}</p>
<Label>{t('sites.site')}</Label>
<Button>{t('common.save')}</Button>
<p className="text-red-600">{error}</p>
```

### Step 5: Add Keys to Translation Files

In `src/i18n/locales/ar.json`:
```json
{
  "sites": {
    "title": "إدارة المواقع",
    "searchPlaceholder": "البحث عن موقع...",
    "site": "الموقع"
  }
}
```

In `src/i18n/locales/en.json`:
```json
{
  "sites": {
    "title": "Sites Management",
    "searchPlaceholder": "Search for a site...",
    "site": "Site"
  }
}
```

## Common Conversion Examples

### Example 1: Form Component

**BEFORE:**
```tsx
export function LoginForm() {
  return (
    <form>
      <Label>البريد الإلكتروني</Label>
      <Input placeholder="أدخل البريد" />
      <Label>كلمة المرور</Label>
      <Input placeholder="أدخل كلمة المرور" type="password" />
      <Button>تسجيل الدخول</Button>
      {error && <p className="text-red-600">خطأ في تسجيل الدخول</p>}
    </form>
  );
}
```

**AFTER:**
```tsx
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const { t } = useTranslation();
  
  return (
    <form dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <Label>{t('auth.email')}</Label>
      <Input placeholder={t('auth.enterEmail')} />
      <Label>{t('auth.password')}</Label>
      <Input placeholder={t('auth.enterPassword')} type="password" />
      <Button>{t('auth.login')}</Button>
      {error && <p className="text-red-600">{t('auth.loginFailed')}</p>}
    </form>
  );
}
```

### Example 2: Table Component

**BEFORE:**
```tsx
export function SitesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>اسم الموقع</TableHead>
          <TableHead>النوع</TableHead>
          <TableHead>الكود</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map(site => (
          <TableRow key={site.id}>
            <TableCell>{site.name}</TableCell>
            <TableCell>{site.type === 'water' ? 'مستوى مياه' : 'محطة رفع'}</TableCell>
            <TableCell>{site.code}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">تعديل</Button>
              <Button variant="destructive" size="sm">حذف</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**AFTER:**
```tsx
import { useTranslation } from 'react-i18next';

export function SitesTable() {
  const { t } = useTranslation();
  
  return (
    <Table dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <TableHeader>
        <TableRow>
          <TableHead>{t('sites.siteName')}</TableHead>
          <TableHead>{t('sites.siteType')}</TableHead>
          <TableHead>{t('sites.code')}</TableHead>
          <TableHead>{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map(site => (
          <TableRow key={site.id}>
            <TableCell>{site.name}</TableCell>
            <TableCell>
              {site.type === 'water' ? t('sites.waterLevel') : t('sites.pumpStation')}
            </TableCell>
            <TableCell>{site.code}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">{t('common.edit')}</Button>
              <Button variant="destructive" size="sm">{t('common.delete')}</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Example 3: Dialog Component

**BEFORE:**
```tsx
export function AddUserDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>
            ملء النموذج لإضافة مستخدم جديد إلى النظام
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>الاسم الكامل</Label>
            <Input placeholder="أدخل الاسم الكامل" />
          </div>
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input placeholder="أدخل البريد" type="email" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">إلغاء</Button>
          <Button>إضافة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**AFTER:**
```tsx
import { useTranslation } from 'react-i18next';

export function AddUserDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('users.newUser')}</DialogTitle>
          <DialogDescription>
            {t('users.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('users.fullName')}</Label>
            <Input placeholder={t('users.fullName')} />
          </div>
          <div>
            <Label>{t('auth.email')}</Label>
            <Input placeholder={t('auth.email')} type="email" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">{t('common.cancel')}</Button>
          <Button>{t('common.add')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Example 4: Card with Dynamic Content

**BEFORE:**
```tsx
export function StatCard() {
  const stats = useDashboardData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>إجمالي المواقع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{stats.totalSites}</div>
        <p className="text-xs text-gray-500 mt-1">
          جميع المواقع متصلة
        </p>
      </CardContent>
    </Card>
  );
}
```

**AFTER:**
```tsx
import { useTranslation } from 'react-i18next';

export function StatCard() {
  const { t } = useTranslation();
  const stats = useDashboardData();
  
  return (
    <Card dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t('dashboard.totalSites')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{stats.totalSites}</div>
        <p className="text-xs text-gray-500 mt-1">
          {t('dashboard.allConnected')}
        </p>
      </CardContent>
    </Card>
  );
}
```

## Key Categories for Different Components

### For User Management
```
users.title
users.addUser
users.fullName
users.email
users.role
users.admin
users.operator
```

### For Alarm Management
```
alarms.title
alarms.addThresholdAlarm
alarms.alarmName
alarms.threshold
alarms.severity
alarms.critical
alarms.warning
```

### For Readings
```
readings.title
readings.addReading
readings.selectSite
readings.selectDate
readings.importSuccess
readings.importError
```

### For Forms/Validation
```
validation.required
validation.email
validation.phone
validation.invalidNumber
errors.loadingFailed
errors.saveFailed
```

## Important Tips

1. **Always add `dir` attribute to root element** using `t('_rtl')`
2. **Use consistent key naming** - see [I18N_QUICK_REFERENCE.md](I18N_QUICK_REFERENCE.md)
3. **Add keys to BOTH ar.json AND en.json** - both files must be in sync
4. **Test in both languages** after conversion
5. **For errors and dynamic messages**, still use the variable, just wrap the label/prefix
6. **For conditional text**, create separate keys for each option (don't use dynamic keys)

## Quick Checklist

- [ ] Added `import { useTranslation }`
- [ ] Added `const { t } = useTranslation()`
- [ ] Added `dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}` to root container
- [ ] Replaced all hardcoded Arabic with `t('key')`
- [ ] Replaced all hardcoded English with `t('key')`
- [ ] Added all new keys to `ar.json`
- [ ] Added all new keys to `en.json`
- [ ] Tested with Arabic (شامل)
- [ ] Tested with English (complete)
- [ ] Verified RTL/LTR switching works

---

**Pro Tip:** Copy this template and modify it for each component conversion. It takes only 5-10 minutes per component!
