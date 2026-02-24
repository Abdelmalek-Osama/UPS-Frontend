import i18n from '../../../i18n';

export const validateAlarmName = (name: string): string | undefined => {
    const t = i18n.t;
    
    if (!name.trim()) {
        return t('alarms.validation.alarmNameEmpty');
    }
    if (name.trim().length < 3) {
        return t('alarms.validation.alarmNameMinLength');
    }
    // Regex to allow English and Arabic letters, numbers, and middle spaces
    const regex = /^[a-zA-Z0-9\s\u0600-\u06FF]+$/;
    if (!regex.test(name)) {
        return t('alarms.validation.alarmNameInvalidCharacters');
    }
    if (name.startsWith(' ') || name.endsWith(' ')) {
        return t('alarms.validation.alarmNameWhitespace');
    }
    return undefined;
};
