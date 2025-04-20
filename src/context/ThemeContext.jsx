import { createContext, useState, useEffect } from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create the theme context
export const ThemeContext = createContext();

// Pages that should not have theme applied
const EXCLUDED_PAGES = ["/", "/login", "/register"];

export const ThemeProvider = ({ children }) => {
  const storedTheme = localStorage.getItem("theme") || "light"; // Read from localStorage
  const [themeMode, setThemeMode] = useState(storedTheme);

  // Instead of using useLocation directly, we'll check the URL manually
  // This is safer and works outside of Router context
  const getCurrentPath = () => {
    return window.location.pathname;
  };

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("theme", newTheme); // Save choice in localStorage
  };

  // Check if the current path should have a theme applied
  const shouldApplyTheme = !EXCLUDED_PAGES.includes(getCurrentPath());

  // Use light theme for excluded pages regardless of settings
  const effectiveThemeMode = shouldApplyTheme ? themeMode : "light";

  // Dynamically create theme for MUI
  const theme = createTheme({
    palette: {
      mode: effectiveThemeMode,
      ...(effectiveThemeMode === "dark"
        ? {
            // Dark theme colors
            primary: {
              main: "#5667ff",
              dark: "#3949ab",
              light: "#7986cb",
              contrastText: "#ffffff",
            },
            secondary: {
              main: "#f50057",
              dark: "#c51162",
              light: "#ff4081",
              contrastText: "#ffffff",
            },
            background: {
              default: "#121212",
              paper: "#1E1E1E",
            },
            text: {
              primary: "#ffffff",
              secondary: "#b0b0b0",
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }
        : {
            // Light theme colors
            primary: {
              main: "#1a237e", // Keep existing primary color
              dark: "#0d1b60",
              light: "#534bae",
              contrastText: "#ffffff",
            },
            secondary: {
              main: "#f50057",
              dark: "#c51162",
              light: "#ff4081",
              contrastText: "#ffffff",
            },
            background: {
              default: "#f4f4f4",
              paper: "#ffffff",
            },
            text: {
              primary: "#000000",
              secondary: "#616161",
            },
            divider: "rgba(0, 0, 0, 0.12)",
          }),
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow:
              effectiveThemeMode === "dark"
                ? "0 1px 3px rgba(0,0,0,0.5)"
                : "0 1px 3px rgba(0,0,0,0.1)",
          },
        },
      },
    },
  });

  // Set up a listener for URL changes to update theme when navigating
  useEffect(() => {
    const handleUrlChange = () => {
      // This will re-evaluate shouldApplyTheme on URL changes
      const path = getCurrentPath();
      // We don't need to do anything here, the component will re-render and update effectiveThemeMode
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, shouldApplyTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
