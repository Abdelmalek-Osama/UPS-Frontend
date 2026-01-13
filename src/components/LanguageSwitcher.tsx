import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language === 'ar' 
    ? (t('common.language_ar') || 'العربية')
    : (t('common.language_en') || 'English');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('common.switchLanguage') || 'Switch language'}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                i18n.changeLanguage('en');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${i18n.language === 'en' ? 'font-semibold' : ''}`}
            >
              {t('common.language_en') || 'English'}
            </button>
            <button
              onClick={() => {
                i18n.changeLanguage('ar');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${i18n.language === 'ar' ? 'font-semibold' : ''}`}
            >
              {t('common.language_ar') || 'العربية'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}