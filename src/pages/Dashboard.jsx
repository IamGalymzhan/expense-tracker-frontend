import { useEffect, useState, useMemo, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  AppBar,
  Toolbar,
  Link,
  Paper,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from "chart.js";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import TopNav from "../components/TopNav";
import { PDFDocument, rgb } from "pdf-lib";
import EmailIcon from "@mui/icons-material/Email";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MonthlyChart from "../components/MonthlyChart";
import { useTranslation } from "react-i18next";
import {
  authService,
  statsService,
  taskService,
  expenseService,
  incomeService,
} from "../services";
import {
  registerTaskUpdateCallback,
  unregisterTaskUpdateCallback,
} from "../services/taskService";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Dashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomeExpenseStats, setIncomeExpenseStats] = useState(null);
  const [timeStats, setTimeStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tips, setTips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const isMountedRef = useRef(true);

  // Define the months array for reuse
  const monthNames = [
    t("dashboard.january"),
    t("dashboard.february"),
    t("dashboard.march"),
    t("dashboard.april"),
    t("dashboard.may"),
    t("dashboard.june"),
    t("dashboard.july"),
    t("dashboard.august"),
    t("dashboard.september"),
    t("dashboard.october"),
    t("dashboard.november"),
    t("dashboard.december"),
  ];

  // Initialize periods with proper translations after component mounts
  useEffect(() => {
    setSelectedPeriod(t("dashboard.thisMonth"));
    setSelectedTimePeriod(t("dashboard.thisMonth"));
    // Set the current month name using the translation
    setSelectedMonth(monthNames[new Date().getMonth()]);
  }, [t, monthNames]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserData = useMemo(
    () => async () => {
      try {
        setLoading(true);
        // Get user profile
        const userData = await authService.getCurrentUser();
        if (isMountedRef.current) {
          setUser(userData);
        }

        // Get monthly stats
        const monthly = await statsService.getMonthlyStats({
          year: new Date().getFullYear(),
        });
        if (isMountedRef.current) {
          setMonthlyStats(monthly);
        }

        // Get financial overview stats
        const overviewStats = await statsService.getOverview({
          period: selectedPeriod,
        });
        if (isMountedRef.current) {
          setIncomeExpenseStats(overviewStats);
        }

        // Get task time stats
        const taskStats = await taskService.getTimeStats(
          {
            period: selectedTimePeriod,
          },
          true
        );
        if (isMountedRef.current) {
          setTimeStats(taskStats);
        }

        // Set notifications and tips
        if (isMountedRef.current) {
          setNotifications([
            {
              id: 1,
              message: t("dashboard.noticeMessage1"),
              date: "2023-05-01",
            },
            {
              id: 2,
              message: t("dashboard.noticeMessage2"),
              date: "2023-05-02",
            },
          ]);

          setTips([
            {
              id: 1,
              title: t("dashboard.tipTitle1"),
              text: t("dashboard.tipText1"),
            },
            {
              id: 2,
              title: t("dashboard.tipTitle2"),
              text: t("dashboard.tipText2"),
            },
          ]);
        }

        if (isMountedRef.current) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedPeriod, selectedTimePeriod, t]
  );

  useEffect(() => {
    let timeoutId;

    // Debounce the fetch call with a longer delay
    timeoutId = setTimeout(() => {
      fetchUserData();
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchUserData]);

  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setSelectedPeriod(newPeriod);
  };

  const handleTimePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setSelectedTimePeriod(newPeriod);
  };

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
  };

  const handleEmailExport = async () => {
    try {
      setIsLoadingEmail(true);

      // Use a service to handle email report sending
      await expenseService.sendReport({
        period: selectedPeriod,
        includeExpenses: true,
        includeIncomes: true,
      });

      alert(t("dashboard.emailSent"));
      setIsLoadingEmail(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(t("dashboard.emailError"));
      setIsLoadingEmail(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      setIsLoadingPdf(true);

      // Use a service to handle PDF export
      const pdfData = await expenseService.exportPDF();

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([pdfData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "dashboard-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setIsLoadingPdf(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(t("dashboard.pdfError"));
      setIsLoadingPdf(false);
    }
  };

  // Memoize the pie chart options
  const pieOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "right",
        },
      },
      maintainAspectRatio: false,
    }),
    []
  );

  // Memoize the monthly chart data
  const monthlyChartData = useMemo(
    () => ({
      labels: monthlyStats
        ? Object.keys(monthlyStats).map((date) =>
            new Date(date).getDate().toString()
          )
        : [],
      datasets: [
        {
          label: t("dashboard.netIncome"),
          data: monthlyStats ? Object.values(monthlyStats) : [],
          borderColor: "#1a237e",
          backgroundColor: "rgba(26, 35, 126, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }),
    [monthlyStats, t]
  );

  // Function to generate dummy data for any month
  const generateMonthData = (monthName) => {
    const months = [
      t("dashboard.january"),
      t("dashboard.february"),
      t("dashboard.march"),
      t("dashboard.april"),
      t("dashboard.may"),
      t("dashboard.june"),
      t("dashboard.july"),
      t("dashboard.august"),
      t("dashboard.september"),
      t("dashboard.october"),
      t("dashboard.november"),
      t("dashboard.december"),
    ];

    const monthIndex = months.indexOf(monthName);
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const data = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(monthIndex + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      data[dateStr] = Math.floor(Math.random() * 45000) - 10000;
    }
    return data;
  };

  useEffect(() => {
    const newData = generateMonthData(selectedMonth);
    setMonthlyStats(newData);
  }, [selectedMonth]);

  // Create a refresh function that only updates task-related data
  const refreshTaskData = async () => {
    if (!isMountedRef.current) return;

    console.log("Dashboard: Refreshing task data");
    try {
      // Get task time stats with force refresh
      const taskStats = await taskService.getTimeStats(
        {
          period: selectedTimePeriod,
        },
        true
      );

      if (isMountedRef.current) {
        setTimeStats(taskStats);
      }
    } catch (error) {
      console.error("Error refreshing task data:", error);
    }
  };

  // Register for task updates when component mounts
  useEffect(() => {
    isMountedRef.current = true;

    // Register the callback for task updates
    registerTaskUpdateCallback(refreshTaskData);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      unregisterTaskUpdateCallback(refreshTaskData);
    };
  }, []);

  // If selectedTimePeriod changes, update the refreshTaskData function
  useEffect(() => {
    // Re-register with the updated closure that has the new selectedTimePeriod
    unregisterTaskUpdateCallback(refreshTaskData);
    registerTaskUpdateCallback(refreshTaskData);
  }, [selectedTimePeriod]);

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
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              mb: { xs: 2, sm: 3 },
              color: "#1a237e",
            }}
          >
            {t("dashboard.title")}
          </Typography>

          {/* User Profile Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 3, md: 4 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              textAlign: { xs: "center", sm: "left" },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Avatar
              sx={{
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                bgcolor: "orange",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {user?.name?.charAt(0) || "A"}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                {user?.name}
              </Typography>
              <Typography
                color="textSecondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {user?.email}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/achievements"
              sx={{
                mt: { xs: 1, sm: 0 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {t("navigation.achievements")}
            </Button>
          </Paper>

          {/* Monthly Net Income Graph */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                {t("dashboard.monthlyNetIncome")}
              </Typography>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                displayEmpty
                renderValue={(value) => {
                  if (value === "") {
                    // Default to current month name if empty
                    return monthNames[new Date().getMonth()];
                  }
                  return value;
                }}
                sx={{
                  width: { xs: "100%", sm: 200 },
                  mb: { xs: 1, sm: 0 },
                }}
              >
                {monthNames.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <MonthlyChart
              data={monthlyChartData}
              title={t("dashboard.monthlyNetIncome")}
              label={t("dashboard.netIncome")}
            />
          </Paper>

          {/* Analysis Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                color: "#000000",
                fontWeight: 500,
              }}
            >
              {t("dashboard.analysis")}
            </Typography>

            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {t("dashboard.incomeExpenseStats")}
            </Typography>

            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              displayEmpty
              renderValue={(value) =>
                value === "" ? t("dashboard.thisMonth") : value
              }
              sx={{
                width: { xs: "100%", sm: 200 },
                mb: { xs: 2, sm: 3 },
              }}
            >
              <MenuItem value={t("dashboard.today")}>
                {t("dashboard.today")}
              </MenuItem>
              <MenuItem value={t("dashboard.week")}>
                {t("dashboard.week")}
              </MenuItem>
              <MenuItem value={t("dashboard.thisWeek")}>
                {t("dashboard.thisWeek")}
              </MenuItem>
              <MenuItem value={t("dashboard.thisMonth")}>
                {t("dashboard.thisMonth")}
              </MenuItem>
              <MenuItem value={t("dashboard.lastMonth")}>
                {t("dashboard.lastMonth")}
              </MenuItem>
            </Select>

            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Stack
                  spacing={{ xs: 2, md: 4 }}
                  direction={{ xs: "column", md: "row" }}
                >
                  {/* Income/Expense Statistics */}
                  <Stack spacing={{ xs: 2, sm: 3 }} flex={1}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        height: { xs: 400, sm: 450 },
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {t("dashboard.recordedIncome")}
                      </Typography>
                      {/* Add Income Categories Pie Chart */}
                      {incomeExpenseStats && incomeExpenseStats.categories && (
                        <Box sx={{ height: 200 }}>
                          <Pie
                            data={{
                              labels: incomeExpenseStats.categories.income
                                .filter((item) => item.amount > 0)
                                .map((item) => item.category),
                              datasets: [
                                {
                                  data: incomeExpenseStats.categories.income
                                    .filter((item) => item.amount > 0)
                                    .map((item) => item.amount),
                                  backgroundColor: [
                                    "#4caf50", // Green
                                    "#2196f3", // Blue
                                    "#9c27b0", // Purple
                                    "#00bcd4", // Cyan
                                    "#ff9800", // Orange
                                  ],
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: "bottom",
                                  labels: {
                                    font: {
                                      size: window.innerWidth < 600 ? 8 : 10,
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                      <Box mt={2}>
                        {incomeExpenseStats?.categories?.income
                          .filter((item) => item.amount > 0)
                          .map((item) => (
                            <Box
                              key={item.category}
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography>{item.category}</Typography>
                              <Typography>
                                {item.amount.toLocaleString()} ₸
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        height: { xs: 400, sm: 450 },
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {t("dashboard.recordedExpenses")}
                      </Typography>
                      {/* Add Expense Categories Pie Chart */}
                      {incomeExpenseStats && incomeExpenseStats.categories && (
                        <Box sx={{ height: 200 }}>
                          <Pie
                            data={{
                              labels: incomeExpenseStats.categories.expense
                                .filter((item) => item.amount > 0)
                                .map((item) => item.category),
                              datasets: [
                                {
                                  data: incomeExpenseStats.categories.expense
                                    .filter((item) => item.amount > 0)
                                    .map((item) => item.amount),
                                  backgroundColor: [
                                    "#f44336", // Red
                                    "#ff9800", // Orange
                                    "#ff5722", // Deep Orange
                                    "#e91e63", // Pink
                                    "#9c27b0", // Purple
                                  ],
                                },
                              ],
                            }}
                            options={{
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: "bottom",
                                  labels: {
                                    font: {
                                      size: window.innerWidth < 600 ? 8 : 10,
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                      <Box mt={2}>
                        {incomeExpenseStats?.categories?.expense
                          .filter((item) => item.amount > 0)
                          .map((item) => (
                            <Box
                              key={item.category}
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography>{item.category}</Typography>
                              <Typography>
                                {item.amount.toLocaleString()} ₸
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </Paper>
                  </Stack>

                  {/* Pie Chart */}
                  <Stack flex={1}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        height: { xs: 400, sm: 450 },
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ height: { xs: 250, sm: 300 } }}>
                        {incomeExpenseStats && (
                          <Pie
                            data={{
                              labels: [
                                t("dashboard.income"),
                                t("dashboard.expense"),
                                t("dashboard.savings"),
                              ],
                              datasets: [
                                {
                                  data: [
                                    incomeExpenseStats.totalIncome || 0,
                                    incomeExpenseStats.totalExpense || 0,
                                    incomeExpenseStats.savings || 0,
                                  ],
                                  backgroundColor: [
                                    "#2196f3",
                                    "#f44336",
                                    "#4caf50",
                                  ],
                                },
                              ],
                            }}
                            options={{
                              ...pieOptions,
                              plugins: {
                                ...pieOptions.plugins,
                                legend: {
                                  ...pieOptions.plugins.legend,
                                  labels: {
                                    font: {
                                      size: window.innerWidth < 600 ? 10 : 12,
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Stack>
                </Stack>

                {/* Time Statistics */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    mt: { xs: 3, sm: 4 },
                    mb: { xs: 1, sm: 2 },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      mb: { xs: 1, sm: 0 },
                      color: "#000000",
                      fontWeight: 500,
                    }}
                  >
                    {t("dashboard.timeStatistics")}
                  </Typography>
                </Box>
                <Select
                  value={selectedTimePeriod}
                  onChange={handleTimePeriodChange}
                  displayEmpty
                  renderValue={(value) =>
                    value === "" ? t("dashboard.thisMonth") : value
                  }
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <MenuItem value={t("dashboard.today")}>
                    {t("dashboard.today")}
                  </MenuItem>
                  <MenuItem value={t("dashboard.week")}>
                    {t("dashboard.week")}
                  </MenuItem>
                  <MenuItem value={t("dashboard.thisWeek")}>
                    {t("dashboard.thisWeek")}
                  </MenuItem>
                  <MenuItem value={t("dashboard.thisMonth")}>
                    {t("dashboard.thisMonth")}
                  </MenuItem>
                  <MenuItem value={t("dashboard.lastMonth")}>
                    {t("dashboard.lastMonth")}
                  </MenuItem>
                </Select>
                <Stack spacing={{ xs: 2, sm: 2 }}>
                  {/* First row of time stats */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 2 }}
                    flexWrap="wrap"
                  >
                    <Stack flex={1} width={{ xs: "100%", sm: "auto" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          height: { xs: 150, sm: 200 },
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {t("dashboard.completedTasks")}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="h4" color="primary">
                            {timeStats?.completedTasks.count || 0}
                          </Typography>
                          <Typography color="textSecondary">
                            {timeStats?.completedTasks.percentage || 0}%{" "}
                            {t("dashboard.completed")}
                          </Typography>
                        </Box>
                      </Paper>
                    </Stack>
                    <Stack flex={1} width={{ xs: "100%", sm: "auto" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          height: { xs: 150, sm: 200 },
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {t("dashboard.incompleteTasks")}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="h4" color="error">
                            {timeStats?.incompleteTasks.count || 0}
                          </Typography>
                          <Typography color="textSecondary">
                            {timeStats?.incompleteTasks.percentage || 0}%{" "}
                            {t("dashboard.incomplete")}
                          </Typography>
                        </Box>
                      </Paper>
                    </Stack>
                  </Stack>
                  {/* Second row of time stats */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 2 }}
                    flexWrap="wrap"
                  >
                    <Stack flex={1} width={{ xs: "100%", sm: "auto" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          height: { xs: 150, sm: 200 },
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {t("dashboard.inProgressTasks")}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="h4" color="warning.main">
                            {timeStats?.inProgressTasks.count || 0}
                          </Typography>
                          <Typography color="textSecondary">
                            {timeStats?.inProgressTasks.percentage || 0}%{" "}
                            {t("dashboard.inProgress")}
                          </Typography>
                        </Box>
                      </Paper>
                    </Stack>
                    <Stack flex={1} width={{ xs: "100%", sm: "auto" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          height: { xs: 150, sm: 200 },
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {t("dashboard.totalTasks")}
                        </Typography>
                        <Box mt={2}>
                          <Typography variant="h4">
                            {timeStats?.totalTasks || 0}
                          </Typography>
                          <Typography color="textSecondary">
                            {t("dashboard.totalTasksCount")}
                          </Typography>
                        </Box>
                      </Paper>
                    </Stack>
                  </Stack>
                </Stack>
              </>
            )}
          </Paper>

          {/* Notifications and Tips */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 3 }}
            mb={{ xs: 2, sm: 3 }}
          >
            {/* ... existing notifications and tips content ... */}
          </Stack>

          {/* Export Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
              justifyContent: "center",
              mt: { xs: 2, sm: 4 },
              mb: { xs: 1, sm: 2 },
            }}
          >
            <Button
              variant="contained"
              loading={isLoadingEmail}
              loadingPosition="start"
              startIcon={<EmailIcon />}
              onClick={handleEmailExport}
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                bgcolor: "#1a237e",
                "&:hover": {
                  bgcolor: "#0d1b60",
                },
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {t("dashboard.sendToEmail")}
            </Button>
            <Button
              variant="contained"
              loading={isLoadingPdf}
              loadingPosition="start"
              startIcon={<PictureAsPdfIcon />}
              onClick={handlePdfExport}
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                bgcolor: "#1a237e",
                "&:hover": {
                  bgcolor: "#0d1b60",
                },
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {t("dashboard.downloadPDF")}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
