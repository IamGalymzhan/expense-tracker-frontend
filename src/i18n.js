import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import kkTranslations from "./locales/kk.json";
import ruTranslations from "./locales/ru.json";

i18n.use(initReactI18next).init({
  resources: {
    kk: {
      translation: kkTranslations,
    },
    ru: {
      translation: ruTranslations,
    },
  },
  lng: localStorage.getItem("language") || "kk",
  fallbackLng: "kk",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
