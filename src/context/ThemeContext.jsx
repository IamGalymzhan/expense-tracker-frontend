import { createContext, useState, useEffect } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Создаём контекст темы
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem("theme") || "light"; // Читаем из localStorage
  const [themeMode, setThemeMode] = useState(storedTheme);

  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("theme", newTheme); // Сохраняем выбор в localStorage
  };

  // Динамически создаём тему для MUI
  const theme = createTheme({
    palette: {
      mode: themeMode,
      ...(themeMode === "dark"
        ? {
            background: {
              default: "#121212",
              paper: "#1E1E1E",
            },
            text: {
              primary: "#ffffff",
            },
          }
        : {
            background: {
              default: "#f4f4f4",
              paper: "#ffffff",
            },
            text: {
              primary: "#000000",
            },
          }),
    },
  });

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
