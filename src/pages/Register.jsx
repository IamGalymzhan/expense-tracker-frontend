import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  AppBar,
  Toolbar,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../services";

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    language: "kk",
    theme: "dark",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await authService.register(formData);
      alert(t("auth.registerSuccess"));
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.registerError"));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #007bff, #6610f2)",
        color: "white",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        sx={{ background: "rgba(0, 0, 0, 0.2)", backdropFilter: "blur(10px)" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            Expense Tracker
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{
                fontSize: "1rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {t("common.home")}
            </Link>
            <Link
              component={RouterLink}
              to="/login"
              color="inherit"
              sx={{
                fontSize: "1rem",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {t("auth.login")}
            </Link>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Register Form */}
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            background: "white",
            color: "black",
            p: 5,
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t("auth.register")}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label={t("auth.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                sx: { color: "black" },
              }}
            />
            <TextField
              label={t("auth.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                sx: { color: "black" },
              }}
            />
            <TextField
              label={t("auth.password")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                sx: { color: "black" },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                bgcolor: "#1a237e",
                "&:hover": { bgcolor: "#0d1b60" },
              }}
            >
              {t("auth.register")}
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login" sx={{ color: "#1a237e" }}>
              {t("auth.hasAccount")}
            </Link>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ background: "#1A1A1A", p: 3, textAlign: "center", mt: "auto" }}
      >
        <Typography color="white">
          © 2025 Expense Tracker. {t("footer.rightsReserved")}
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
