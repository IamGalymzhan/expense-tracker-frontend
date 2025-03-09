import { createContext, useState, useEffect } from "react";
import i18n from "../i18n";

// Создаём контекст языка
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "kk"
  );

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "kk";
    setLanguage(storedLanguage);
    i18n.changeLanguage(storedLanguage);
  }, []);

  // Функция смены языка
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
