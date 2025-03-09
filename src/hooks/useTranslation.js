import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import kk from "../locales/kk.json";
import ru from "../locales/ru.json";

const translations = { kk, ru };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  return {
    t: (key) => translations[language][key] || key,
  };
};
