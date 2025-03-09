import { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { AppBar, Toolbar } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement,
} from "chart.js";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import CustomCalendar from "../components/CustomCalendar";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { taskService } from "../services";
import {
  registerTaskUpdateCallback,
  unregisterTaskUpdateCallback,
} from "../services/taskService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement
);

dayjs.extend(isBetween);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Тапсырма статистикасы",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const Tasks = () => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [tasks, setTasks] = useState([]); // Список всех задач
  const [editTask, setEditTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]); // Отфильтрованные задачи
  const [selectedDate, setSelectedDate] = useState(new Date()); // Выбранная дата
  const [filter, setFilter] = useState("all"); // Фильтр по времени
  const [form, setForm] = useState({
    title: "",
    duration: "",
    deadline: dayjs(),
    status: "PLANNED",
  });
  const navigate = useNavigate();
  const [taskStats, setTaskStats] = useState({
    labels: [t("tasks.noData")],
    datasets: [
      {
        label: t("tasks.timeSpent"),
        data: [0],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  });
  const [totalTimeStats, setTotalTimeStats] = useState({
    labels: [t("tasks.totalTime")],
    datasets: [
      {
        label: t("tasks.totalMinutes"),
        data: [0],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  // 🆕 Состояние для таймера Pomodoro
  const [timer, setTimer] = useState(1500); // 25 минут = 1500 секунд
  const [breakTime, setBreakTime] = useState(false); // 5 минут отдыха
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;
    fetchTasks();

    // Register for task updates from other components
    const refreshData = () => {
      if (isMountedRef.current) {
        console.log("Tasks component: Refreshing task data from notification");
        fetchTasks(true);
      }
    };

    registerTaskUpdateCallback(refreshData);

    return () => {
      isMountedRef.current = false;
      unregisterTaskUpdateCallback(refreshData);
    };
  }, []);

  const fetchTasks = async (forceRefresh = false) => {
    try {
      if (!isMountedRef.current) return;

      setLoading(true);
      const tasks = await taskService.getTasks({}, forceRefresh);

      if (isMountedRef.current) {
        setTasks(tasks);
        applyFilter(filter, tasks);
        setLoading(false);
      }
    } catch (err) {
      console.error(t("tasks.fetchError"), err);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Фильтрация задач по выбранной дате
  const filterTasksByDate = (date, allTasks) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    const filtered = allTasks.filter(
      (task) => dayjs(task.deadline).format("YYYY-MM-DD") === formattedDate
    );
    setFilteredTasks(filtered);
  };

  // Фильтрация задач по временным диапазонам
  const applyFilter = (newFilter, allTasks = tasks) => {
    const today = dayjs().startOf("day");
    const startOfWeek = dayjs().startOf("week");
    const endOfWeek = dayjs().endOf("week");
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");

    let filtered = allTasks;

    if (newFilter === "today") {
      filtered = allTasks.filter((task) =>
        dayjs(task.deadline).isSame(today, "day")
      );
    } else if (newFilter === "week") {
      filtered = allTasks.filter((task) =>
        dayjs(task.deadline).isBetween(startOfWeek, endOfWeek, "day", "[]")
      );
    } else if (newFilter === "month") {
      filtered = allTasks.filter((task) =>
        dayjs(task.deadline).isBetween(startOfMonth, endOfMonth, "day", "[]")
      );
    }

    setFilteredTasks(filtered);
    setFilter(newFilter);
  };

  // Обновление выбранной даты
  const handleDateChange = (date) => {
    setSelectedDate(dayjs(date));
    filterTasksByDate(date, tasks);
  };

  // Обновление выбранного фильтра
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      applyFilter(newFilter);
    }
  };

  // Открытие формы редактирования задачи
  const handleEditTask = (task) => {
    setEditTask(task);
    setForm({ ...task, deadline: dayjs(task.deadline) });
    setOpenDialog(true);
  };

  // Открытие и закрытие модального окна
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTask(null);
  };

  // Обновление данных формы
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    try {
      if (form.id) {
        await taskService.updateTask(form.id, form);
      } else {
        await taskService.createTask(form);
      }
      await taskService.refreshTasks();
      handleCloseDialog();
    } catch (err) {
      console.error(t("tasks.errorSaving"), err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      await taskService.refreshTasks();
    } catch (err) {
      console.error(t("tasks.errorDeleting"), err);
    }
  };

  // 🆕 Запуск / пауза Pomodoro
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            completePomodoroSession();
            return breakTime ? 1500 : 300; // 5 минут отдых -> 25 минут работы
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // 🆕 Завершение Pomodoro с отправкой времени
  const completePomodoroSession = async () => {
    setIsRunning(false);

    if (!breakTime && currentTaskId) {
      try {
        await taskService.addTimeLog(currentTaskId, 25);
        setCurrentTaskId(null);
        alert("Pomodoro сеанс аяқталды. Уақыт жазылды!");
      } catch (err) {
        console.error("Қате уақытты сақтау кезінде:", err);
      }
    }
    setBreakTime(!breakTime);
  };

  // Add refresh button handler
  const handleRefresh = () => {
    fetchTasks(true);
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
            {t("tasks.title")}
          </Typography>

          {/* Calendar and Filters */}
          <Box sx={{ mb: 4 }}>
            <CustomCalendar
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              tasks={tasks}
            />
            <Box sx={{ overflowX: "auto", mt: 2 }}>
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  "& .MuiToggleButton-root": {
                    px: { xs: 1, sm: 2 },
                    py: 1,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  },
                }}
              >
                <ToggleButton value="all">{t("filters.all")}</ToggleButton>
                <ToggleButton value="today">{t("tasks.today")}</ToggleButton>
                <ToggleButton value="week">{t("tasks.thisWeek")}</ToggleButton>
                <ToggleButton value="month">
                  {t("tasks.thisMonth")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Task List */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={{ xs: 2, sm: 0 }}
              mb={2}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {t("tasks.add")}
              </Button>
              <TextField
                label={t("tasks.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: "100%", sm: 200 } }}
                size="small"
              />
            </Stack>

            {/* Task Items */}
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Box
                  key={task._id}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1, sm: 0 },
                  }}
                >
                  <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("tasks.deadline")}:{" "}
                      {dayjs(task.deadline).format("DD.MM.YYYY")}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: { xs: "flex-end", sm: "flex-start" },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Chip
                      label={t(`tasks.${task.status.toLowerCase()}`)}
                      color={
                        task.status === "COMPLETED"
                          ? "success"
                          : task.status === "IN_PROGRESS"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      sx={{ height: { xs: "24px", sm: "32px" } }}
                    />
                    <IconButton
                      onClick={() => handleEditTask(task)}
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleStartPomodoro(task._id)}
                      color={currentTaskId === task._id ? "primary" : "default"}
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      {currentTaskId === task._id ? (
                        isRunning ? (
                          <PauseIcon fontSize="small" />
                        ) : (
                          <PlayArrowIcon fontSize="small" />
                        )
                      ) : (
                        <PlayArrowIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Stack>
                </Box>
              ))
            ) : (
              <Typography
                sx={{ textAlign: "center", my: 3, color: "text.secondary" }}
              >
                {t("tasks.noTasks")}
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { width: { xs: "95%", sm: "auto" }, m: { xs: 1, sm: 2 } },
        }}
      >
        <DialogTitle>{editTask ? t("tasks.edit") : t("tasks.add")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("tasks.title")}
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              size="small"
            />
            <TextField
              label={t("tasks.duration")}
              name="duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
              fullWidth
              size="small"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("tasks.deadline")}
                value={form.deadline}
                onChange={(newValue) =>
                  setForm({ ...form, deadline: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>
            <FormControl fullWidth size="small">
              <InputLabel>{t("tasks.status")}</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                label={t("tasks.status")}
              >
                <MenuItem value="PLANNED">{t("tasks.planned")}</MenuItem>
                <MenuItem value="IN_PROGRESS">{t("tasks.inProgress")}</MenuItem>
                <MenuItem value="COMPLETED">{t("tasks.completed")}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pomodoro Timer */}
      {currentTaskId && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 10, sm: 20 },
            right: { xs: 10, sm: 20 },
            bgcolor: "white",
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            zIndex: 1100,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </Typography>
          <IconButton
            onClick={handleToggleTimer}
            size="small"
            sx={{ p: { xs: 0.5, sm: 1 } }}
          >
            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={handleResetTimer}
            size="small"
            sx={{ p: { xs: 0.5, sm: 1 } }}
          >
            <ReplayIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default Tasks;
