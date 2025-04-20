import { useEffect, useState } from "react";
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
import axios from "axios";
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
import { incomeService } from "../services";

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

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
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
  const theme = useTheme();

  const [categoryFilter, setCategoryFilter] = useState(t("incomes.all"));
  const [dateFilter, setDateFilter] = useState(t("incomes.all"));
  const navigate = useNavigate();

  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [stats, setStats] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
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

  useEffect(() => {
    fetchIncomes();
  }, [selectedMonth]);

  const fetchIncomes = async () => {
    try {
      const incomesData = await incomeService.getIncomes();

      setIncomes(incomesData);
      applyFilters(incomesData);
      updateChartData(incomesData);
      updateStats(incomesData);
      setLoading(false);
    } catch (err) {
      console.error(t("incomes.errorLoading"), err);
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = [...data];

    // Filter by month
    filtered = filtered.filter((income) => {
      const incomeDate = dayjs(income.date);
      return incomeDate.month() === selectedMonth;
    });

    if (categoryFilter !== t("incomes.all")) {
      filtered = filtered.filter(
        (income) => income.category === categoryFilter
      );
    }

    if (dateFilter !== t("incomes.all")) {
      const now = dayjs();
      filtered = filtered.filter((income) => {
        const incomeDate = dayjs(income.date);

        if (dateFilter === t("incomes.thisYear"))
          return incomeDate.year() === now.year();
        if (dateFilter === t("incomes.thisMonth"))
          return (
            incomeDate.month() === now.month() &&
            incomeDate.year() === now.year()
          );
        if (dateFilter === t("incomes.thisWeek"))
          return incomeDate.isAfter(now.subtract(7, "day"));

        return true;
      });
    }

    setFilteredIncomes(filtered);
    updateChartData(filtered);
    updateStats(filtered);
  };

  useEffect(() => {
    if (incomes.length > 0) {
      applyFilters(incomes);
    }
  }, [categoryFilter, dateFilter, selectedMonth]);

  const updateChartData = (data) => {
    // First ensure we're only looking at the selected month's data
    const monthData = data.filter((income) => {
      const incomeDate = dayjs(income.date);
      return incomeDate.month() === selectedMonth;
    });

    const categoryTotals = monthData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          label: t("incomes.chartLabel"),
          data: Object.values(categoryTotals),
          backgroundColor: "rgba(46, 125, 50, 0.6)",
        },
      ],
    });
  };

  const updateStats = (data) => {
    // First ensure we're only looking at the selected month's data
    const monthData = data.filter((income) => {
      const incomeDate = dayjs(income.date);
      return incomeDate.month() === selectedMonth;
    });

    const dailyTotals = monthData.reduce((acc, income) => {
      const date = dayjs(income.date).format("DD");
      acc[date] = (acc[date] || 0) + Number(income.amount);
      return acc;
    }, {});

    // Create an array of all days in the month
    const daysInMonth = dayjs().month(selectedMonth).daysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, "0")
    );

    // Map values to all days, using 0 for days without incomes
    const values = labels.map((day) => dailyTotals[day] || 0);

    setStats({
      labels,
      datasets: [
        {
          label: t("incomes.chartLineLabel"),
          data: values,
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    });
  };

  const handleOpenDialog = (income = null) => {
    if (income) {
      setForm(income);
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
        await incomeService.updateIncome(form.id, form);
      } else {
        await incomeService.createIncome(form);
      }
      fetchIncomes();
      handleCloseDialog();
    } catch (err) {
      console.error(t("incomes.errorSaving"), err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await incomeService.deleteIncome(id);
      fetchIncomes();
    } catch (err) {
      console.error(t("incomes.errorDeleting"), err);
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

      const response = await incomeService.exportExcel(startDate, endDate);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "incomes.xlsx");
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
            {t("navigation.incomes")}
          </Typography>

          {/* Monthly Incomes Chart */}
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
                {t("incomes.incomesByCategory")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={t("incomes.all")}>
                    {t("incomes.all")}
                  </MenuItem>
                  <MenuItem value={t("incomes.salary")}>
                    {t("incomes.salary")}
                  </MenuItem>
                  <MenuItem value={t("incomes.investments")}>
                    {t("incomes.investments")}
                  </MenuItem>
                  <MenuItem value={t("incomes.additionalIncome")}>
                    {t("incomes.additionalIncome")}
                  </MenuItem>
                  <MenuItem value={t("incomes.other")}>
                    {t("incomes.other")}
                  </MenuItem>
                </Select>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
              <MonthlyChart data={stats} label={t("incomes.chartLineLabel")} />
            </Box>
          </Paper>

          {/* Incomes List Section */}
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
                {t("incomes.incomesList")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  minWidth: "auto",
                  px: 2,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {t("incomes.add")}
              </Button>
            </Box>

            <TableContainer sx={{ minWidth: { xs: "100%", sm: 650 } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("incomes.category")}</TableCell>
                    <TableCell>{t("incomes.amount")}</TableCell>
                    <TableCell>{t("incomes.date")}</TableCell>
                    <TableCell>{t("incomes.note")}</TableCell>
                    <TableCell align="right">{t("incomes.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {income.category}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {income.amount}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(income.date).format("DD.MM.YYYY")}
                      </TableCell>
                      <TableCell>{income.note || "-"}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(income)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(income.id)}
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
              {t("incomes.exportToExcel")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Add/Edit Income Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {form.id ? t("incomes.editIncome") : t("incomes.addIncome")}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>{t("incomes.category")}</InputLabel>
            <Select
              label={t("incomes.category")}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <MenuItem value={t("incomes.salary")}>
                {t("incomes.salary")}
              </MenuItem>
              <MenuItem value={t("incomes.investments")}>
                {t("incomes.investments")}
              </MenuItem>
              <MenuItem value={t("incomes.additionalIncome")}>
                {t("incomes.additionalIncome")}
              </MenuItem>
              <MenuItem value={t("incomes.other")}>
                {t("incomes.other")}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t("incomes.amount")}
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            label={t("incomes.date")}
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
            label={t("incomes.note")}
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

export default Incomes;
