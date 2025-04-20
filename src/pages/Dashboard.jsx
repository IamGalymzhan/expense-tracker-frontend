import { useEffect, useState, useMemo, useRef, useContext } from "react";
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
  useTheme,
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MonthlyChart from "../components/MonthlyChart";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
import dayjs from "dayjs";

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

// Create a context or singleton to store user data to avoid multiple auth calls
let cachedUserData = null;

// Cache for statistics data to prevent excessive API calls
const statsCache = {
  overview: {}, // Cache by period
  monthly: {}, // Cache by year-month
  timeStats: {}, // Cache by period
};

// Request tracking to prevent duplicate in-flight requests
const pendingRequests = {
  overview: {},
  monthly: {},
  timeStats: {},
};

// Function to convert UI period values to API period values
const getPeriodForApi = (uiPeriod, t) => {
  // Map the translated UI values to the API expected values
  const periodMap = {
    [t("dashboard.today")]: "today",
    [t("dashboard.week")]: "week",
    [t("dashboard.thisWeek")]: "thisWeek",
    [t("dashboard.thisMonth")]: "thisMonth",
    [t("dashboard.lastMonth")]: "lastMonth",
    [t("dashboard.thisYear")]: "thisYear",
  };

  return periodMap[uiPeriod] || "thisMonth"; // Default to thisMonth if mapping not found
};

const Dashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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
  const isMountedRef = useRef(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth()
  );
  const initialLoadRef = useRef(false);
  const lastSelectedPeriod = useRef("");
  const lastSelectedTimePeriod = useRef("");
  const dashboardRef = useRef(null);

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

  // Ref to track if month has been initialized
  const monthInitializedRef = useRef(false);

  // Initialize periods with proper translations after component mounts
  useEffect(() => {
    // Prevent re-initialization
    if (monthInitializedRef.current) {
      return;
    }

    monthInitializedRef.current = true;

    const currentPeriod = t("dashboard.thisMonth");
    setSelectedPeriod(currentPeriod);
    setSelectedTimePeriod(currentPeriod);
    lastSelectedPeriod.current = currentPeriod;
    lastSelectedTimePeriod.current = currentPeriod;

    // Set the current month name using the translation
    const currentMonthIndex = new Date().getMonth();
    setSelectedMonthIndex(currentMonthIndex);

    // Make sure the selected month is set properly and synchronized with the index
    const monthName = monthNames[currentMonthIndex];
    setSelectedMonth(monthName);

    console.log("INITIAL month setup:", monthName, "index:", currentMonthIndex);
  }, [t, monthNames]);

  // Debug when selectedMonth changes
  useEffect(() => {
    if (selectedMonth) {
      console.log("selectedMonth state changed to:", selectedMonth);
    }
  }, [selectedMonth]);

  // Function to get user data with caching to avoid rate limiting
  const getUserData = async () => {
    try {
      // Use cached data if available
      if (cachedUserData) {
        return cachedUserData;
      }

      const userData = await authService.getCurrentUser();
      cachedUserData = userData; // Cache the user data
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Function to get overview statistics with caching
  const getOverviewStats = async (uiPeriod) => {
    // Convert UI period to API period
    const period = getPeriodForApi(uiPeriod, t);

    // Return cached data if available
    if (statsCache.overview[period]) {
      return statsCache.overview[period];
    }

    // Check if there's already a pending request for this period
    if (pendingRequests.overview[period]) {
      return pendingRequests.overview[period];
    }

    // Create a new request and store the promise
    const requestPromise = statsService.getOverview({ period });
    pendingRequests.overview[period] = requestPromise;

    try {
      const data = await requestPromise;
      // Cache the result
      statsCache.overview[period] = data;
      // Clear the pending request
      delete pendingRequests.overview[period];
      return data;
    } catch (error) {
      console.error(
        `Error fetching overview stats for period ${period}:`,
        error
      );
      delete pendingRequests.overview[period];
      throw error;
    }
  };

  // Function to get monthly statistics with caching
  const getMonthlyStats = async (year, month) => {
    const cacheKey = `${year}-${month}`;

    // Return cached data if available
    if (statsCache.monthly[cacheKey]) {
      return statsCache.monthly[cacheKey];
    }

    // Check if there's already a pending request
    if (pendingRequests.monthly[cacheKey]) {
      return pendingRequests.monthly[cacheKey];
    }

    // Create a new request and store the promise
    const requestPromise = statsService.getMonthlyStats({ year, month });
    pendingRequests.monthly[cacheKey] = requestPromise;

    try {
      const data = await requestPromise;
      // Cache the result
      statsCache.monthly[cacheKey] = data;
      // Clear the pending request
      delete pendingRequests.monthly[cacheKey];
      return data;
    } catch (error) {
      console.error(
        `Error fetching monthly stats for ${year}-${month}:`,
        error
      );
      delete pendingRequests.monthly[cacheKey];
      throw error;
    }
  };

  // Function to get time statistics with caching
  const getTimeStats = async (uiPeriod) => {
    // Convert UI period to API period
    const period = getPeriodForApi(uiPeriod, t);

    // Return cached data if available
    if (statsCache.timeStats[period]) {
      return statsCache.timeStats[period];
    }

    // Check if there's already a pending request
    if (pendingRequests.timeStats[period]) {
      return pendingRequests.timeStats[period];
    }

    // Create a new request and store the promise
    const requestPromise = taskService.getTimeStats({ period }, true);
    pendingRequests.timeStats[period] = requestPromise;

    try {
      const data = await requestPromise;
      // Cache the result
      statsCache.timeStats[period] = data;
      // Clear the pending request
      delete pendingRequests.timeStats[period];
      return data;
    } catch (error) {
      console.error(`Error fetching time stats for period ${period}:`, error);
      delete pendingRequests.timeStats[period];
      throw error;
    }
  };

  // Separate useEffect to fetch initial data only once on component mount
  useEffect(() => {
    // Prevent duplicate initial loads
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Get user profile (using cached version if available)
        const userData = await getUserData();
        if (isMountedRef.current) {
          setUser(userData);
        }

        const currentPeriod = t("dashboard.thisMonth");
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        // Fetch data in parallel using our cached functions
        const [monthly, overviewStats, taskStats] = await Promise.all([
          getMonthlyStats(year, month),
          getOverviewStats(currentPeriod),
          getTimeStats(currentPeriod),
        ]);

        if (isMountedRef.current) {
          setMonthlyStats(monthly);
          setIncomeExpenseStats(overviewStats);
          setTimeStats(taskStats);

          // Set notifications and tips
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

          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [t]); // Only run on mount and language changes

  // Add back the cleanup function
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // This only fetches period-based data, not user or monthly data
  const fetchPeriodData = useMemo(
    () => async () => {
      // Don't fetch if already loading or if the period hasn't changed
      if (loading) return;

      // Skip if the period hasn't actually changed
      if (
        selectedPeriod === lastSelectedPeriod.current &&
        selectedTimePeriod === lastSelectedTimePeriod.current
      ) {
        return;
      }

      // Update the last selected periods
      lastSelectedPeriod.current = selectedPeriod;
      lastSelectedTimePeriod.current = selectedTimePeriod;

      try {
        setLoading(true);

        // Get data in parallel using our cached functions
        const [overviewStats, taskStats] = await Promise.all([
          getOverviewStats(selectedPeriod),
          getTimeStats(selectedTimePeriod),
        ]);

        if (isMountedRef.current) {
          setIncomeExpenseStats(overviewStats);
          setTimeStats(taskStats);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching period data:", error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedPeriod, selectedTimePeriod, loading]
  );

  // Only trigger fetchPeriodData when period filters change (not when month changes)
  useEffect(() => {
    // Don't fetch on initial mount, the initial data load handles this
    if (!initialLoadRef.current) return;

    let timeoutId;

    // Debounce the fetch call with a longer delay
    timeoutId = setTimeout(() => {
      fetchPeriodData();
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchPeriodData]);

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
    console.log("Month changed to:", newMonth);
    setSelectedMonth(newMonth); // Set the new selected month

    // Update the month index as well
    const newMonthIndex = monthNames.indexOf(newMonth);
    if (newMonthIndex !== -1) {
      console.log("New month index:", newMonthIndex);
      setSelectedMonthIndex(newMonthIndex);

      // Only fetch monthly data, not all data
      fetchMonthlyData(newMonthIndex);
    }
  };

  // Separate function to fetch monthly data only
  const fetchMonthlyData = (monthIndex) => {
    if (loading) return; // Prevent overlapping requests

    const year = new Date().getFullYear();
    const month = monthIndex + 1; // API expects 1-12 for months

    // Check if we already have this data cached
    const cacheKey = `${year}-${month}`;
    if (statsCache.monthly[cacheKey]) {
      setMonthlyStats(statsCache.monthly[cacheKey]);
      return;
    }

    setLoading(true);

    getMonthlyStats(year, month)
      .then((data) => {
        if (isMountedRef.current) {
          setMonthlyStats(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching monthly stats:", error);
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
  };

  const handlePdfExport = async () => {
    try {
      setIsLoadingPdf(true);

      if (!dashboardRef.current) {
        console.error("Dashboard ref is not available");
        setIsLoadingPdf(false);
        return;
      }

      // Display a message to the user
      alert(t("dashboard.preparingPdf"));

      // Reference to the dashboard container
      const dashboardElement = dashboardRef.current;

      // Create a new jsPDF instance in portrait A4 format
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // margin in mm

      // Available content area
      const contentWidth = pageWidth - 2 * margin;

      // Add only a simple date in DD/MM/YYYY format at the top to avoid encoding issues
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-GB"); // DD/MM/YYYY format

      pdf.setFontSize(12);
      pdf.text(dateStr, margin, margin + 5);

      // Starting Y position after the date
      let yPosition = margin + 15;

      // We'll split the dashboard into logical sections and capture each one separately
      const sections = Array.from(
        dashboardElement.querySelectorAll('div[class*="MuiPaper-root"]')
      );
      if (sections.length === 0) {
        // Fallback if we can't find the Paper components
        const allElements = Array.from(dashboardElement.children);
        sections.push(...allElements);
      }

      // Process each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section) continue;

        try {
          // Use html2canvas to capture the current section
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          // Calculate dimensions for the image in the PDF
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if we need to add a new page before adding this section
          if (yPosition + imgHeight > pageHeight - margin && i > 0) {
            pdf.addPage();
            yPosition = margin; // Reset position for new page
          }

          // Add the section image to the PDF
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);

          // Update the y-position for the next section
          yPosition += imgHeight + 10; // Add a small gap between sections
        } catch (err) {
          console.error("Error capturing section:", err);
          // Continue with the next section if one fails
        }
      }

      // Generate a filename with date
      const fileName = `dashboard-report-${dayjs().format("YYYY-MM-DD")}.pdf`;

      // Save the PDF
      pdf.save(fileName);

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

  // Create a refresh function that only updates task-related data
  const refreshTaskData = async () => {
    if (!isMountedRef.current) return;

    console.log("Dashboard: Refreshing task data");
    try {
      // Convert UI period to API period
      const period = getPeriodForApi(selectedTimePeriod, t);

      // Get task time stats with force refresh
      const taskStats = await taskService.getTimeStats(
        {
          period: period,
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
    // Skip registration if we're not mounted
    if (!isMountedRef.current) return;

    console.log("Registering initial task update callback");
    // Register the callback for task updates
    registerTaskUpdateCallback(refreshTaskData);

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up task update callback");
      isMountedRef.current = false;
      unregisterTaskUpdateCallback(refreshTaskData);
    };
  }, []);

  // If selectedTimePeriod changes, update the refreshTaskData function
  useEffect(() => {
    // Skip if component isn't mounted or if we're still initializing
    if (!isMountedRef.current || !initialLoadRef.current) return;

    console.log(
      "Re-registering task update callback due to time period change"
    );
    // Re-register with the updated closure that has the new selectedTimePeriod
    unregisterTaskUpdateCallback(refreshTaskData);
    registerTaskUpdateCallback(refreshTaskData);
  }, [selectedTimePeriod]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default }}>
      <TopNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="lg" ref={dashboardRef}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              mb: { xs: 2, sm: 3 },
              color: theme.palette.primary.main,
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
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
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
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
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
                displayEmpty={false}
                renderValue={(selected) => selected}
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
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                color: theme.palette.text.primary,
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
                        bgcolor: theme.palette.background.paper,
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
                        bgcolor: theme.palette.background.paper,
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
                        bgcolor: theme.palette.background.paper,
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
                      color: theme.palette.text.primary,
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
                          bgcolor: theme.palette.background.paper,
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
                          bgcolor: theme.palette.background.paper,
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
                          bgcolor: theme.palette.background.paper,
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
                          bgcolor: theme.palette.background.paper,
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
              startIcon={<PictureAsPdfIcon />}
              onClick={handlePdfExport}
              disabled={isLoadingPdf}
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {isLoadingPdf
                ? t("dashboard.generating")
                : t("dashboard.exportPdf")}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
