# Remaining Components - Conversion Checklist

Use this checklist to track progress on converting the remaining components to use i18n.

## Legend
- ⬜ Not Started
- 🟨 In Progress
- ✅ Completed

---

## Alarms Feature Components

### [ ] AlarmConfiguration.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] "تكوين التنبيهات" → `alarms.title`
- [ ] "تكوين وإدارة تنبيهات النظام" → `alarms.subtitle`
- [ ] "تنبيهات القيمة الحدية" → `alarms.thresholdAlarms`
- [ ] "تنبيهات التواصل" → `alarms.communicationAlarms`
- [ ] "إضافة تنبيه قيمة حدية" → `alarms.addThresholdAlarm`
- [ ] "إضافة تنبيه تواصل" → `alarms.addCommunicationAlarm`
- [ ] "تمت إضافة تنبيه القيمة الحدية بنجاح" → `alarms.addAlarmSuccess`
- [ ] "تمت إضافة تنبيه فقدان الاتصال بنجاح" → `alarms.addCommunicationAlarmSuccess`

**Conversion Steps:**
```
1. Add: import { useTranslation } from 'react-i18next';
2. Add: const { t } = useTranslation();
3. Replace all hardcoded text with t() calls
4. Add dir attribute to main container
5. Test in both Arabic and English
```

---

### [ ] AlarmEvents.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] "أحداث التنبيهات" → `alarms.events`
- [ ] "التاريخ" → `common.date`
- [ ] "الموقع" → `alarms.site`
- [ ] "الحالة" → `common.status`
- [ ] "الإجراء" → Navigation/button text

---

### [ ] RecipientInput.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] "إضافة بريد إلكتروني" → `alarms.emails`
- [ ] "إضافة رقم هاتف" → `alarms.phones`
- [ ] "إزالة" → `common.delete`
- [ ] "اسم البريد الإلكتروني" → `auth.email`
- [ ] "رقم الهاتف" → `users.phone`

---

### [ ] ThresholdAlarmTable.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Table headers: "اسم التنبيه", "الموقع", "الحد", etc.
- [ ] Action buttons: "تعديل", "حذف"
- [ ] Status indicators

---

### [ ] CommunicationAlarmTable.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Table headers
- [ ] Action buttons
- [ ] Status messages

---

### [ ] EditThresholdAlarmDialog.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Dialog title: "تعديل تنبيه القيمة الحدية"
- [ ] Form labels
- [ ] Button text

---

### [ ] EditCommunicationAlarmDialog.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Dialog title: "تعديل تنبيه فقدان الاتصال"
- [ ] Form labels
- [ ] Button text

---

### [ ] AddThresholdAlarmDialog.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Dialog title: "إضافة تنبيه قيمة حدية"
- [ ] Form labels
- [ ] Select options
- [ ] Error messages

---

## Readings Feature Components

### [ ] ReadingsManagement.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] "إدارة القراءات" → `readings.title`
- [ ] "إدارة قراءات محطات الرفع ومستويات المياه" → `readings.subtitle`
- [ ] "قراءات مستويات المياه" → `readings.waterLevelReadings`
- [ ] "قراءات محطة الرفع" → `readings.pumpStationReadings`
- [ ] "اختر الموقع" → `readings.selectSite`
- [ ] "اختر التاريخ" → `readings.selectDate`
- [ ] "إضافة قراءة" → `readings.addReading`
- [ ] Tab labels
- [ ] Button text

---

### [ ] WaterLevelTable.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Table headers: "USWL", "DSWL", "التاريخ", etc.
- [ ] Action buttons
- [ ] Error messages: "الموقع المحدد غير صالح"
- [ ] "لا يمكن إضافة قراءة في المستقبل"

---

### [ ] PumpStationTable.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] Table headers
- [ ] Form labels
- [ ] Action buttons

---

## Users Feature Components

### [ ] UserManagement.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] "إدارة المستخدمين" → `users.title`
- [ ] "إدارة حسابات المستخدمين والصلاحيات" → `users.subtitle`
- [ ] "إضافة مستخدم جديد" → `users.newUser`
- [ ] Table headers: "الاسم", "البريد", "الدور", etc.
- [ ] Action buttons
- [ ] Status indicators

---

### [ ] AddUserDialog.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] Dialog title: "إضافة مستخدم جديد" → `users.newUser`
- [ ] Form labels: "الاسم الكامل", "البريد الإلكتروني", etc.
- [ ] Select options: "مسؤول", "مشغل"
- [ ] Error messages: "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
- [ ] Validation messages

---

### [ ] EditUserDialog.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] Dialog title: "تعديل بيانات المستخدم" → `users.editUser`
- [ ] Form labels
- [ ] Select options
- [ ] Button text

---

### [ ] ResetPasswordDialog.tsx
**Status:** ⬜ Not Started

**Hardcoded Text Found:**
- [ ] Dialog title: "إعادة تعيين كلمة المرور" → `users.resetPassword`
- [ ] Form labels: "كلمة المرور الجديدة", "تأكيد كلمة المرور"
- [ ] Error messages: "كلمات المرور غير متطابقة"
- [ ] Button text

---

## Flow Calculations Feature

### [ ] FlowCalculations.tsx
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] "حسابات التدفق" → `flowCalculations.title`
- [ ] "تكوين وإدارة معادلات حساب التدفق" → `flowCalculations.subtitle`
- [ ] Form labels: "المتغيرات", "الثوابت", "المعادلة"
- [ ] Button text: "حفظ المعادلة"
- [ ] Messages: "تم حفظ المعادلة بنجاح"

---

## Other Components

### [ ] AuditLogs.tsx (if exists)
**Status:** ⬜ Not Started

**Expected Hardcoded Text:**
- [ ] "سجلات التدقيق" → `auditLogs.title`
- [ ] Table headers: "الوقت", "المستخدم", "الإجراء", etc.
- [ ] Filter options

---

## Conversion Progress Tracking

### Week 1 Goal: Alarms Feature
```
Target: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
        ALC ALV RCI TAT CAT ETA ECA ATA

Progress: 0/8 components
```

### Week 2 Goal: Readings & Users Features
```
Target: [ ] [ ] [ ] [ ] [ ] [ ]
        RDM WLT PST UMG ADD EDU RES

Progress: 0/7 components
```

### Week 3 Goal: Flow Calculations & Other
```
Target: [ ] [ ]
        FLC AUL

Progress: 0/2 components
```

---

## Quick Copy-Paste Templates

### Imports to Add
```tsx
import { useTranslation } from 'react-i18next';
```

### Hook to Add
```tsx
const { t } = useTranslation();
```

### Container Wrapper
```tsx
<div dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
  {/* Component content */}
</div>
```

---

## Testing Template

For each component converted, follow this checklist:

### [ ] Translation Keys Present
- [ ] All new keys added to `src/i18n/locales/ar.json`
- [ ] All new keys added to `src/i18n/locales/en.json`
- [ ] Keys match exactly between both files

### [ ] Functional Testing
- [ ] Component renders without errors
- [ ] All text displays correctly in Arabic
- [ ] All text displays correctly in English
- [ ] Language switcher works
- [ ] RTL/LTR direction changes properly
- [ ] No console errors

### [ ] UI/UX Testing
- [ ] Layout looks good in Arabic (RTL)
- [ ] Layout looks good in English (LTR)
- [ ] Text alignment is correct
- [ ] Icons are positioned correctly
- [ ] Buttons are accessible
- [ ] Forms work in both directions

### [ ] Responsive Testing
- [ ] Desktop view works (both languages)
- [ ] Tablet view works (both languages)
- [ ] Mobile view works (both languages)

---

## Key Translation Resources

**Common Translations:**

| Arabic | English | Key Path |
|--------|---------|----------|
| تسجيل الدخول | Login | `auth.login` |
| تسجيل الخروج | Logout | `auth.logout` |
| حفظ | Save | `common.save` |
| إلغاء | Cancel | `common.cancel` |
| حذف | Delete | `common.delete` |
| تعديل | Edit | `common.edit` |
| إضافة | Add | `common.add` |
| جاري التحميل... | Loading... | `common.loading` |
| خطأ | Error | `common.error` |
| نجح | Success | `common.success` |

For complete list, see [I18N_QUICK_REFERENCE.md](I18N_QUICK_REFERENCE.md)

---

## Tips for Faster Conversion

1. **Use Find & Replace:** Search for hardcoded text and batch-replace with `t()` calls
2. **Copy Working Examples:** Reference already-converted components (LoginPage, DashboardHome)
3. **Test Early:** Don't wait until the end to test
4. **Create Keys First:** Add all keys to translation files before updating component
5. **Use Template:** Copy the template structure for consistency

---

## Completion Criteria

A component is considered fully converted when:

✅ All visible text uses `t()` calls
✅ All keys present in both `ar.json` and `en.json`
✅ Component renders correctly in Arabic
✅ Component renders correctly in English
✅ RTL/LTR direction updates properly
✅ No console errors or warnings
✅ Tested on desktop and mobile
✅ Code reviewed by team member

---

## Support & Questions

For help:
1. Check [COMPONENT_CONVERSION_TEMPLATE.md](COMPONENT_CONVERSION_TEMPLATE.md) for examples
2. Review [I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md) for details
3. Check already-converted components for patterns
4. Refer to [I18N_QUICK_REFERENCE.md](I18N_QUICK_REFERENCE.md) for key paths

---

**Estimated Effort:**
- Time per component: 5-15 minutes
- Total remaining components: 15
- Estimated total time: 2-4 hours

**Good luck! 🚀**
