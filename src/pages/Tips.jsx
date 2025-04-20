import {
  Container,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
} from "@mui/material";
import TopNav from "../components/TopNav";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CircleIcon from "@mui/icons-material/Circle";
import tips1Bg from "../assets/tips/tips1.png";
import tips2Bg from "../assets/tips/tips2.png";
import { useTranslation } from "react-i18next";

const Tips = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const timeManagementTips = [
    {
      title: t("tips.timeTips.importantFirst.title"),
      content: t("tips.timeTips.importantFirst.content"),
    },
    {
      title: t("tips.timeTips.pomodoro.title"),
      content: t("tips.timeTips.pomodoro.content"),
    },
    {
      title: t("tips.timeTips.dailyPlan.title"),
      content: t("tips.timeTips.dailyPlan.content"),
    },
    {
      title: t("tips.timeTips.timeThieves.title"),
      content: t("tips.timeTips.timeThieves.content"),
    },
    {
      title: t("tips.timeTips.multitasking.title"),
      content: t("tips.timeTips.multitasking.content"),
    },
    {
      title: t("tips.timeTips.todoList.title"),
      content: t("tips.timeTips.todoList.content"),
    },
    {
      title: t("tips.timeTips.timeAnalysis.title"),
      content: t("tips.timeTips.timeAnalysis.content"),
    },
  ];

  const financialTips = [
    {
      title: t("tips.financialTips.trackExpenses.title"),
      content: t("tips.financialTips.trackExpenses.content"),
    },
    {
      title: t("tips.financialTips.reduceUnnecessary.title"),
      content: t("tips.financialTips.reduceUnnecessary.content"),
    },
    {
      title: t("tips.financialTips.watchSales.title"),
      content: t("tips.financialTips.watchSales.content"),
    },
    {
      title: t("tips.financialTips.avoidDebt.title"),
      content: t("tips.financialTips.avoidDebt.content"),
    },
    {
      title: t("tips.financialTips.planAhead.title"),
      content: t("tips.financialTips.planAhead.content"),
    },
    {
      title: t("tips.financialTips.payYourself.title"),
      content: t("tips.financialTips.payYourself.content"),
    },
  ];

  return (
    <Box>
      <TopNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          fontFamily:
            "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              mb: { xs: 2, sm: 3 },
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontFamily:
                "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
            }}
          >
            {t("tips.title")}
          </Typography>

          {/* Time Management Tips */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${tips1Bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccessTimeIcon
                  sx={{
                    mr: 2,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    color: "white",
                    fontWeight: 500,
                    fontFamily:
                      "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                  }}
                >
                  {t("tips.timeManagement")}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              {timeManagementTips.map((tip, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 1,
                    "&:before": {
                      display: "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.background.default
                          : "#f8fafc",
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontFamily:
                          "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                      }}
                    >
                      {tip.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        fontFamily:
                          "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                      }}
                    >
                      {tip.content.split("\n").map((paragraph, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          {paragraph.startsWith("•") ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                              }}
                            >
                              <CircleIcon
                                sx={{
                                  fontSize: 8,
                                  mt: 1,
                                  color: theme.palette.text.primary,
                                }}
                              />
                              <Typography
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontFamily:
                                    "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                                }}
                              >
                                {paragraph.substring(2)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {paragraph}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                display: "block",
                color: theme.palette.text.secondary,
                p: { xs: 1.5, sm: 2, md: 3 },
                pt: 0,
              }}
            >
              Пайдалы кеңестерге сілтеме:{" "}
              <a
                href="https://vc.ru/life/991598-99-sposobov-sekonomit-vremya-chtoby-potratit-ego-so-smyslom"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                }}
              >
                https://vc.ru/life/991598-99-sposobov-sekonomit-vremya-chtoby-potratit-ego-so-smyslom
              </a>
            </Typography>
          </Paper>

          {/* Financial Tips */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${tips2Bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountBalanceWalletIcon
                  sx={{
                    mr: 2,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    color: "white",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    color: "white",
                    fontWeight: 500,
                    fontFamily:
                      "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                  }}
                >
                  {t("tips.financial")}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              {financialTips.map((tip, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 1,
                    "&:before": {
                      display: "none",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.background.default
                          : "#f8fafc",
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        fontFamily:
                          "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                      }}
                    >
                      {tip.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        fontFamily:
                          "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                      }}
                    >
                      {tip.content.split("\n").map((paragraph, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          {paragraph.startsWith("•") ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                              }}
                            >
                              <CircleIcon
                                sx={{
                                  fontSize: 8,
                                  mt: 1,
                                  color: theme.palette.text.primary,
                                }}
                              />
                              <Typography
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontFamily:
                                    "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
                                }}
                              >
                                {paragraph.substring(2)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {paragraph}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 2,
                display: "block",
                color: theme.palette.text.secondary,
                p: { xs: 1.5, sm: 2, md: 3 },
                pt: 0,
              }}
            >
              Пайдалы кеңестерге сілтеме:{" "}
              <a
                href="https://financer.kz/sberezheniya/sovety-po-ekonomii/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                }}
              >
                https://financer.kz/sberezheniya/sovety-po-ekonomii/
              </a>
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Tips;
