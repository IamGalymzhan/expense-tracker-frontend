import ReactDOM from "react-dom/client";
import { CssBaseline, createTheme } from "@mui/material";
import AppRouter from "./routes/AppRouter";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <CssBaseline />
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  </ThemeProvider>
);
