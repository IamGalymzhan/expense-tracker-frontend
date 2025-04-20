import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TopNav from "../components/TopNav";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AlarmIcon from "@mui/icons-material/Alarm";
import { notificationService } from "../services";
import { useTheme } from "@mui/material/styles";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();

      // Debug log to see the response structure
      console.log("Notifications API response:", response);

      // Handle different response formats - make sure we have an array
      const notificationsArray = Array.isArray(response)
        ? response
        : response.notifications || [];

      setNotifications(notificationsArray);
      setLoading(false);
    } catch (err) {
      console.error(t("notifications.errorLoading"), err);
      setError(t("notifications.errorLoading"));
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);

      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );

      setSnackbar({
        open: true,
        message: t("notifications.markedAsRead"),
        severity: "success",
      });
    } catch (err) {
      console.error(t("notifications.errorMarking"), err);
      setSnackbar({
        open: true,
        message: t("notifications.errorMarking"),
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);

      // Remove from local state
      setNotifications(notifications.filter((notif) => notif.id !== id));

      setSnackbar({
        open: true,
        message: t("notifications.deleted"),
        severity: "success",
      });
    } catch (err) {
      console.error(t("notifications.errorDeleting"), err);
      setSnackbar({
        open: true,
        message: t("notifications.errorDeleting"),
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to get the appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "WARNING":
        return <WarningIcon color="warning" />;
      case "REMINDER":
        return <AlarmIcon color="secondary" />;
      case "INFO":
      default:
        return <InfoIcon color="primary" />;
    }
  };

  return (
    <Box>
      <TopNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            {t("notifications.title")}
          </Typography>

          {/* Notifications list */}
          {loading ? (
            <Box sx={{ width: "100%", mt: 4 }}>
              <LinearProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : notifications.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
            >
              <NotificationsIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                {t("notifications.noNotifications")}
              </Typography>
            </Box>
          ) : (
            <List>
              {Array.isArray(notifications) &&
                notifications.map((notification, index) => (
                  <Box key={notification.id || index}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        bgcolor: notification.read
                          ? "inherit"
                          : "rgba(25, 118, 210, 0.05)",
                        py: 2,
                      }}
                    >
                      <Box mr={2} mt={0.5}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{
                                fontWeight: notification.read
                                  ? "normal"
                                  : "bold",
                              }}
                            >
                              {notification.message}
                            </Typography>
                            {!notification.read && (
                              <Chip
                                label={t("notifications.new")}
                                size="small"
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {dayjs(notification.createdAt).fromNow()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Grid container spacing={1}>
                          {!notification.read && (
                            <Grid item>
                              <IconButton
                                edge="end"
                                aria-label="mark as read"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <DoneIcon />
                              </IconButton>
                            </Grid>
                          )}
                          <Grid item>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Box>
                ))}
            </List>
          )}
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;
