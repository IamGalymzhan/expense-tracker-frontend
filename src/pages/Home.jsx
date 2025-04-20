import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../locales";
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
// Import images
import backgroundImage from "../assets/home/back1.png";
import moneyImage from "../assets/home/money.png";
import timeImage from "../assets/home/time.png";

const Home = () => {
  const { language } = useContext(LanguageContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Light theme colors for consistent styling
  const lightThemeColors = {
    primary: "#1a237e",
    secondary: "#f50057",
    background: "#f4f4f4",
    paper: "#ffffff",
    text: {
      primary: "#000000",
      secondary: "#616161",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: lightThemeColors.background, // Ensure light background for the entire page
        color: lightThemeColors.text.primary, // Ensure light theme text color
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ background: lightThemeColors.primary }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              color: "#ffffff",
            }}
          >
            Expence Tracker
          </Typography>
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Кіру
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Тіркелу
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: { xs: 4, sm: 6, md: 8 },
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.75rem" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Expence Tracker
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Қаржылық шығындарыңызды басқарып, уақытты тиімді жоспарлаңыз. Бізбен
            бірге өз өнімділігіңізді арттырыңыз!
          </Typography>
        </Container>
      </Box>

      {/* Features Section - Ensuring light background */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: lightThemeColors.paper,
          color: lightThemeColors.text.primary,
        }}
      >
        <Typography
          variant="h3"
          textAlign="center"
          gutterBottom
          sx={{
            mb: { xs: 4, sm: 5, md: 6 },
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
            color: lightThemeColors.text.primary,
          }}
        >
          Платформа мүмкіндіктері
        </Typography>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* First Feature */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                mb: { xs: 2, md: 0 },
              }}
            >
              <img
                src={moneyImage}
                alt="Expense Management"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  maxHeight: isMobile ? "300px" : "400px",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                textAlign: { xs: "center", md: "left" },
                color: lightThemeColors.text.primary,
              }}
            >
              Шығындарды басқару
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                textAlign: { xs: "center", md: "left" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: lightThemeColors.text.secondary,
              }}
            >
              Барлық қаржылық операцияларыңызды бір жерде басқаруға мүмкіндік
              беретін жүйе.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: { xs: "center", md: "left" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: lightThemeColors.text.secondary,
              }}
            >
              Шығындарды категориялар бойынша сұрыптап, олардың динамикасын
              графиктер арқылы бақылап, қай салаға қанша қаражат жұмсалатынын
              нақты көріңіз. Қаржы әдеттеріңізді бағалап, үнемдеудің тиімді
              жолдарын табуға көмектеседі.
            </Typography>
          </Grid>

          {/* Second Feature */}
          <Grid item xs={12} md={6} sx={{ order: { xs: 4, md: 3 } }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                textAlign: { xs: "center", md: "left" },
                mt: { xs: 4, md: 0 },
                color: lightThemeColors.text.primary,
              }}
            >
              Уақытты бақылау
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                textAlign: { xs: "center", md: "left" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: lightThemeColors.text.secondary,
              }}
            >
              Күнделікті жоспарларыңызды реттеп, уақытыңызды тиімді пайдалануға
              арналған ыңғайлы құрал.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: { xs: "center", md: "left" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                color: lightThemeColors.text.secondary,
              }}
            >
              Уақытты басқару статистикасы қай істерге көп уақыт жұмсайтыныңызды
              анықтап, күнделікті әдеттеріңізді жақсартуға мүмкіндік береді.
              Мақсаттар қойып, өзіңіздің жетістіктеріңізді бақылау арқылы
              жұмысыңыздың тиімділігін арттырыңыз.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ order: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                mt: { xs: 2, md: 0 },
              }}
            >
              <img
                src={timeImage}
                alt="Time Management"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  maxHeight: isMobile ? "300px" : "400px",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            gap: { xs: 2, sm: 4 },
            mt: { xs: 4, sm: 6 },
          }}
        >
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            sx={{
              bgcolor: "#ffc107",
              color: "black",
              "&:hover": { bgcolor: "#ffa000" },
              px: { xs: 6, sm: 4 },
              py: 1,
              borderRadius: 10,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Кіру
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to="/register"
            sx={{
              bgcolor: "#ffc107",
              color: "black",
              "&:hover": { bgcolor: "#ffa000" },
              px: { xs: 6, sm: 4 },
              py: 1,
              borderRadius: 10,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Тіркелу
          </Button>
        </Box>
      </Container>

      {/* Contact Section */}
      <Box sx={{ bgcolor: "#f5f5f5", py: { xs: 4, sm: 6, md: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant="h3"
            textAlign="center"
            gutterBottom
            sx={{
              mb: { xs: 4, sm: 5, md: 6 },
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
              color: lightThemeColors.text.primary,
            }}
          >
            Байланыс
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  height: "100%",
                  mb: { xs: 2, sm: 0 },
                  bgcolor: lightThemeColors.paper,
                }}
              >
                <LocationOnIcon
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: lightThemeColors.primary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    color: lightThemeColors.text.primary,
                  }}
                >
                  Мекен-жайы
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    color: lightThemeColors.text.secondary,
                  }}
                >
                  Қазақстан, Астана қ.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  height: "100%",
                  mb: { xs: 2, sm: 0 },
                  bgcolor: lightThemeColors.paper,
                }}
              >
                <EmailIcon
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: lightThemeColors.primary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    color: lightThemeColors.text.primary,
                  }}
                >
                  E-mail
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    wordBreak: "break-word",
                    color: lightThemeColors.text.secondary,
                  }}
                >
                  support.expence-tracker@gmail.com
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: "center",
                  height: "100%",
                  bgcolor: lightThemeColors.paper,
                }}
              >
                <PhoneIcon
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: lightThemeColors.primary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    color: lightThemeColors.text.primary,
                  }}
                >
                  Телефон
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    color: lightThemeColors.text.secondary,
                  }}
                >
                  +7 777 777 7777
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
