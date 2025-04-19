import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import kkTranslations from "./locales/kk.json";
import ruTranslations from "./locales/ru.json";
import enTranslations from "./locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    kk: {
      translation: kkTranslations,
    },
    ru: {
      translation: ruTranslations,
    },
    en: {
      translation: enTranslations,
    },
  },
  lng: localStorage.getItem("language") || "kk",
  fallbackLng: "kk",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
