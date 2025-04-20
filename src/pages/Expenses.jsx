import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  AppBar,
  Toolbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import TopNav from "../components/TopNav";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EmailIcon from "@mui/icons-material/Email";
import MonthlyChart from "../components/MonthlyChart";
import { expenseService } from "../services";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 2,
    },
  },
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    id: null,
    category: "",
    amount: "",
    date: "",
    note: "",
  });
  const { t } = useTranslation();

  const [categoryFilter, setCategoryFilter] = useState(t("expenses.all"));
  const [dateFilter, setDateFilter] = useState(t("expenses.all"));
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [stats, setStats] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        fill: true,
      },
    ],
  });

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

  const theme = useTheme();

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

  const fetchExpenses = async () => {
    try {
      const expensesData = await expenseService.getExpenses();

      setExpenses(expensesData);
      applyFilters(expensesData);
      updateChartData(expensesData);
      updateStats(expensesData);
      setLoading(false);
    } catch (err) {
      console.error(t("expenses.errorLoading"), err);
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    // Filter by month
    filtered = filtered.filter((expense) => {
      const expenseDate = dayjs(expense.date);
      return expenseDate.month() === selectedMonth;
    });

    if (categoryFilter !== t("expenses.all")) {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    if (dateFilter !== t("expenses.all")) {
      const now = dayjs();
      filtered = filtered.filter((expense) => {
        const expenseDate = dayjs(expense.date);

        if (dateFilter === t("expenses.thisYear"))
          return expenseDate.year() === now.year();
        if (dateFilter === t("expenses.thisMonth"))
          return (
            expenseDate.month() === now.month() &&
            expenseDate.year() === now.year()
          );
        if (dateFilter === t("expenses.thisWeek"))
          return expenseDate.isAfter(now.subtract(7, "day"));

        return true;
      });
    }

    setFilteredExpenses(filtered);
    updateChartData(filtered);
    updateStats(filtered);
  };

  useEffect(() => {
    if (expenses.length > 0) {
      applyFilters(expenses);
    }
  }, [categoryFilter, dateFilter, selectedMonth]);

  const updateChartData = (data) => {
    // First ensure we're only looking at the selected month's data
    const monthData = data.filter((expense) => {
      const expenseDate = dayjs(expense.date);
      return expenseDate.month() === selectedMonth;
    });

    const categoryTotals = monthData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          label: t("expenses.chartLabel"),
          data: Object.values(categoryTotals),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    });
  };

  const updateStats = (data) => {
    // First ensure we're only looking at the selected month's data
    const monthData = data.filter((expense) => {
      const expenseDate = dayjs(expense.date);
      return expenseDate.month() === selectedMonth;
    });

    const dailyTotals = monthData.reduce((acc, expense) => {
      const date = dayjs(expense.date).format("DD");
      acc[date] = (acc[date] || 0) + Number(expense.amount);
      return acc;
    }, {});

    // Create an array of all days in the month
    const daysInMonth = dayjs().month(selectedMonth).daysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );

    // Map values to all days, using 0 for days without expenses
    const values = labels.map((day) => dailyTotals[day] || 0);

    setStats({
      labels,
      datasets: [
        {
          label: t("expenses.chartLineLabel"),
          data: values,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    });
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setForm(expense);
    } else {
      setForm({
        id: null,
        category: "",
        amount: "",
        date: dayjs().format("YYYY-MM-DD"),
        note: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({
      id: null,
      category: "",
      amount: "",
      date: "",
      note: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await expenseService.updateExpense(form.id, form);
      } else {
        await expenseService.createExpense(form);
      }

      fetchExpenses();
      handleCloseDialog();
    } catch (err) {
      console.error(t("expenses.errorSaving"), err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      console.error(t("expenses.errorDeleting"), err);
    }
  };

  const handleExportExcel = async () => {
    try {
      // Calculate first and last day of the selected month
      const year = new Date().getFullYear();
      const startDate = dayjs(new Date(year, selectedMonth, 1)).format(
        "YYYY-MM-DD"
      );
      const endDate = dayjs(new Date(year, selectedMonth + 1, 0)).format(
        "YYYY-MM-DD"
      );

      const response = await expenseService.exportExcel(startDate, endDate);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(t("expenses.errorExportingExcel"), err);
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
          bgcolor: theme.palette.background.default,
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
              color: theme.palette.text.primary,
              fontWeight: 500,
            }}
          >
            {t("navigation.expenses")}
          </Typography>

          {/* Monthly Expenses Chart */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: { xs: 1, sm: 2 },
                mb: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  textAlign: { xs: "center", sm: "left" },
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                }}
              >
                {t("expenses.expensesByCategory")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={t("expenses.all")}>
                    {t("expenses.all")}
                  </MenuItem>
                  <MenuItem value={t("expenses.food")}>
                    {t("expenses.food")}
                  </MenuItem>
                  <MenuItem value={t("expenses.utilities")}>
                    {t("expenses.utilities")}
                  </MenuItem>
                  <MenuItem value={t("expenses.transport")}>
                    {t("expenses.transport")}
                  </MenuItem>
                  <MenuItem value={t("expenses.entertainment")}>
                    {t("expenses.entertainment")}
                  </MenuItem>
                  <MenuItem value={t("expenses.other")}>
                    {t("expenses.other")}
                  </MenuItem>
                </Select>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {monthNames.map((month, index) => (
                    <MenuItem key={index} value={index}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <MonthlyChart data={stats} label={t("expenses.expenses")} />
            </Box>
          </Paper>

          {/* Expenses List Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              width: "100%",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              mb: { xs: 3, sm: 4 },
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 0 },
                mb: { xs: 2, sm: 3 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  textAlign: { xs: "center", sm: "left" },
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                }}
              >
                {t("expenses.expensesList")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  minWidth: "auto",
                  px: 2,
                  height: 36,
                }}
              >
                {t("expenses.add")}
              </Button>
            </Box>

            <TableContainer sx={{ minWidth: { xs: "100%", sm: 650 } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("expenses.category")}</TableCell>
                    <TableCell>{t("expenses.amount")}</TableCell>
                    <TableCell>{t("expenses.date")}</TableCell>
                    <TableCell>{t("expenses.note")}</TableCell>
                    <TableCell align="right">{t("expenses.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {expense.category}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {expense.amount}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(expense.date).format("DD.MM.YYYY")}
                      </TableCell>
                      <TableCell>{expense.note || "-"}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(expense)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Export Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 2 },
              justifyContent: "center",
              mt: { xs: 2, sm: 4 },
              mb: { xs: 3, sm: 4 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              {t("expenses.exportToExcel")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {form.id ? t("expenses.editExpense") : t("expenses.addExpense")}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>{t("expenses.category")}</InputLabel>
            <Select
              label={t("expenses.category")}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <MenuItem value={t("expenses.food")}>
                {t("expenses.food")}
              </MenuItem>
              <MenuItem value={t("expenses.utilities")}>
                {t("expenses.utilities")}
              </MenuItem>
              <MenuItem value={t("expenses.transport")}>
                {t("expenses.transport")}
              </MenuItem>
              <MenuItem value={t("expenses.entertainment")}>
                {t("expenses.entertainment")}
              </MenuItem>
              <MenuItem value={t("expenses.other")}>
                {t("expenses.other")}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t("expenses.amount")}
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            label={t("expenses.date")}
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t("expenses.note")}
            name="note"
            value={form.note}
            onChange={handleChange}
            fullWidth
            margin="dense"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
