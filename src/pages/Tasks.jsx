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
    status: t("tasks.planned"),
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
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              sx={{ mt: 2 }}
            >
              <ToggleButton value="all">{t("filters.all")}</ToggleButton>
              <ToggleButton value="today">{t("tasks.today")}</ToggleButton>
              <ToggleButton value="week">{t("tasks.thisWeek")}</ToggleButton>
              <ToggleButton value="month">{t("tasks.thisMonth")}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Task List */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                {t("tasks.add")}
              </Button>
              <TextField
                label={t("tasks.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 200 }}
              />
            </Stack>

            {/* Task Items */}
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Box
                  key={task._id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("tasks.deadline")}:{" "}
                      {dayjs(task.deadline).format("DD.MM.YYYY")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={task.status}
                      color={
                        task.status === t("tasks.completed")
                          ? "success"
                          : task.status === t("tasks.inProgress")
                          ? "primary"
                          : "default"
                      }
                    />
                    <IconButton onClick={() => handleEditTask(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleStartPomodoro(task._id)}
                      color={currentTaskId === task._id ? "primary" : "default"}
                    >
                      {currentTaskId === task._id ? (
                        isRunning ? (
                          <PauseIcon />
                        ) : (
                          <PlayArrowIcon />
                        )
                      ) : (
                        <PlayArrowIcon />
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
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editTask ? t("tasks.edit") : t("tasks.add")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("tasks.title")}
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label={t("tasks.duration")}
              name="duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("tasks.deadline")}
                value={form.deadline}
                onChange={(newValue) =>
                  setForm({ ...form, deadline: newValue })
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            <FormControl fullWidth>
              <InputLabel>{t("tasks.status")}</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                label={t("tasks.status")}
              >
                <MenuItem value={t("tasks.planned")}>
                  {t("tasks.planned")}
                </MenuItem>
                <MenuItem value={t("tasks.inProgress")}>
                  {t("tasks.inProgress")}
                </MenuItem>
                <MenuItem value={t("tasks.completed")}>
                  {t("tasks.completed")}
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
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
            bottom: 20,
            right: 20,
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </Typography>
          <IconButton onClick={handleToggleTimer}>
            {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={handleResetTimer}>
            <ReplayIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default Tasks;
