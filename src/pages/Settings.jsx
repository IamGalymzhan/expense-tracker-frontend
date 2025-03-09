import { useState, useContext, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  Stack,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  TextField,
  Button,
  FormControlLabel,
} from "@mui/material";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { AppBar, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useTranslation } from "react-i18next";
import { userService } from "../services";

const Settings = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage } = useContext(LanguageContext);

  const [notifications, setNotifications] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState({
    language: language,
    theme: theme,
    notifications: notifications,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const profile = await userService.getProfile();
      setSettings(profile.preferences);
      setNotifications(profile.preferences.notifications || false);

      // Set user profile data
      setName(profile.name || "");
      setEmail(profile.email || "");
    } catch (err) {
      console.error(t("settings.errorLoading"), err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await userService.updateProfile({
        name,
        email,
        preferences: { ...settings, notifications: notifications },
      });

      // Refresh the settings to show updated values
      await fetchSettings();
      alert(t("common.saveSuccess"));
    } catch (err) {
      console.error(t("settings.errorSaving"), err);
      alert(t("settings.errorSaving"));
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert(t("settings.passwordRequired"));
      return;
    }

    try {
      await userService.updatePassword({
        oldPassword,
        newPassword,
      });

      alert(t("settings.passwordChanged"));
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(t("settings.errorChangingPassword"), err);
      alert(t("settings.passwordChangeError"));
    }
  };

  const handleLanguageChange = async (event) => {
    try {
      const newLanguage = event.target.value;
      await userService.updateProfile({
        preferences: { ...settings, language: newLanguage },
      });
      setSettings((prev) => ({ ...prev, language: newLanguage }));
      changeLanguage(newLanguage);
    } catch (err) {
      console.error(t("settings.errorSaving"), err);
    }
  };

  const handleNotificationsChange = (event) => {
    const newValue = event.target.checked;
    setNotifications(newValue);
    setSettings((prev) => ({ ...prev, notifications: newValue }));
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <Box>
      <TopNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              mb: { xs: 2, sm: 3 },
              color: "#1a237e",
              textAlign: "center",
            }}
          >
            {t("settings.title")}
          </Typography>

          {/* Profile Settings */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: 4,
              borderRadius: 2,
              bgcolor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                textAlign: "center",
                mb: 3,
              }}
            >
              {t("settings.profile")}
            </Typography>
            <Stack spacing={2} sx={{ width: "100%", maxWidth: "500px" }}>
              <TextField
                label={t("settings.fullName")}
                fullWidth
                variant="outlined"
                value={name}
                onChange={handleNameChange}
              />
              <TextField
                label={t("settings.email")}
                fullWidth
                variant="outlined"
                value={email}
                onChange={handleEmailChange}
              />
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                sx={{
                  bgcolor: "#1a237e",
                  "&:hover": {
                    bgcolor: "#0d1b60",
                  },
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  minWidth: "150px",
                  alignSelf: "center",
                }}
              >
                {t("common.save")}
              </Button>
            </Stack>
          </Paper>

          {/* App Settings */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: 4,
              borderRadius: 2,
              bgcolor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Notification Settings */}
            <Box sx={{ width: "100%", maxWidth: "500px", mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  textAlign: "center",
                  mb: 3,
                }}
              >
                {t("settings.notifications")}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={handleNotificationsChange}
                    />
                  }
                  label={t("settings.enableNotifications")}
                />
              </Box>
            </Box>

            {/* Language Settings */}
            <Box sx={{ width: "100%", maxWidth: "500px", mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  textAlign: "center",
                  mb: 3,
                }}
              >
                {t("settings.language")}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>{t("settings.language")}</InputLabel>
                  <Select
                    value={language}
                    onChange={handleLanguageChange}
                    label={t("settings.language")}
                  >
                    <MenuItem value="kk">{t("settings.kazakh")}</MenuItem>
                    <MenuItem value="ru">{t("settings.russian")}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Password Change */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: 2,
              bgcolor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                textAlign: "center",
                mb: 3,
              }}
            >
              {t("settings.changePassword")}
            </Typography>
            <Stack spacing={2} sx={{ width: "100%", maxWidth: "500px" }}>
              <TextField
                label={t("settings.currentPassword")}
                type="password"
                fullWidth
                variant="outlined"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextField
                label={t("settings.newPassword")}
                type="password"
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleChangePassword}
                sx={{
                  bgcolor: "#1a237e",
                  "&:hover": {
                    bgcolor: "#0d1b60",
                  },
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  minWidth: "150px",
                  alignSelf: "center",
                }}
              >
                {t("settings.updatePassword")}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Settings;
