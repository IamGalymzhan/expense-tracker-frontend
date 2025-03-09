import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import HelpIcon from "@mui/icons-material/Help";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslation } from "react-i18next";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const TopNav = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    {
      text: t("navigation.dashboard"),
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    { text: t("navigation.tasks"), icon: <AssignmentIcon />, path: "/tasks" },
    {
      text: t("navigation.expenses"),
      icon: <MoneyOffIcon />,
      path: "/expenses",
    },
    {
      text: t("navigation.incomes"),
      icon: <AttachMoneyIcon />,
      path: "/incomes",
    },
    {
      text: t("navigation.notifications"),
      icon: <NotificationsIcon />,
      path: "/notifications",
    },
    { text: t("navigation.tips"), icon: <LightbulbIcon />, path: "/tips" },
    {
      text: t("navigation.achievements"),
      icon: <EmojiEventsIcon />,
      path: "/achievements",
    },
    {
      text: t("navigation.help"),
      icon: <HelpIcon />,
      path: "/help",
    },
    {
      text: t("navigation.settings"),
      icon: <SettingsIcon />,
      path: "/settings",
    },
    { text: t("navigation.logout"), icon: <ExitToAppIcon />, path: "/" },
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#1a237e" }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open menu"
          edge="start"
          onClick={handleMenuOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              bgcolor: "#1a237e",
              color: "white",
              mt: 0.5,
              "& .MuiMenuItem-root": {
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              component={RouterLink}
              to={item.path}
              onClick={handleMenuClose}
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {item.text}
            </MenuItem>
          ))}
        </Menu>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold", textAlign: "right" }}
        >
          {t("navigation.appTitle")}
        </Typography>
        <IconButton
          color="inherit"
          title={t("navigation.help")}
          component={RouterLink}
          to="/help"
        >
          <HelpIcon />
        </IconButton>
        <IconButton
          color="inherit"
          title={t("navigation.notifications")}
          component={RouterLink}
          to="/notifications"
        >
          <NotificationsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
