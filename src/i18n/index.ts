import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

// Helper function to update document attributes and styles based on language
const applyLanguageStyles = (lng: string) => {
  const html = document.documentElement;
  html.lang = lng;
  html.dir = lng === "ar" ? "rtl" : "ltr";
  
  // Apply font families based on language
  if (lng === "ar") {
    html.style.fontFamily = "'Segoe UI', 'Tajawal', sans-serif";
  } else {
    html.style.fontFamily = "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  }
};

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: localStorage.getItem("language") || "ar",
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
});

i18n.on("languageChanged", (lng) => {
  // Persist language choice to localStorage
  localStorage.setItem("language", lng);
  // Apply language-specific styling
  applyLanguageStyles(lng);
});

// Initialize document attributes on app start
applyLanguageStyles(i18n.language);

export default i18n;
