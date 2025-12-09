export const validateAlarmName = (name: string): string | undefined => {
    if (!name.trim()) {
        return "اسم التنبيه لا يمكن أن يكون فارغًا";
    }
    if (name.trim().length < 3) {
        return "اسم التنبيه يجب أن يتكون من 3 أحرف على الأقل";
    }
    // Regex to allow English and Arabic letters, numbers, and middle spaces
    const regex = /^[a-zA-Z0-9\s\u0600-\u06FF]+$/;
    if (!regex.test(name)) {
        return "يجب أن يحتوي اسم التنبيه على أحرف إنجليزية أو عربية وأرقام ومسافات فقط";
    }
    if (name.startsWith(' ') || name.endsWith(' ')) {
        return "لا يمكن أن يحتوي اسم التنبيه على مسافات بادئة أو لاحقة";
    }
    return undefined;
};
