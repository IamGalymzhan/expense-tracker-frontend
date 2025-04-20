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
  Divider,
  InputAdornment,
  useTheme,
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
import DeleteIcon from "@mui/icons-material/Delete";
import TodayIcon from "@mui/icons-material/Today";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [tasks, setTasks] = useState([]); // Список всех задач
  const [editTask, setEditTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]); // Отфильтрованные задачи
  const [selectedDate, setSelectedDate] = useState(new Date()); // Выбранная дата
  const [filter, setFilter] = useState("all"); // Фильтр по времени
  const [form, setForm] = useState({
    title: "",
    duration: "",
    deadline: null, // Initialize as null to indicate "not set"
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
    // Only filter tasks that have a deadline
    const filtered = allTasks.filter(
      (task) =>
        task.deadline &&
        dayjs(task.deadline).format("YYYY-MM-DD") === formattedDate
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
      filtered = allTasks.filter(
        (task) => task.deadline && dayjs(task.deadline).isSame(today, "day")
      );
    } else if (newFilter === "week") {
      filtered = allTasks.filter(
        (task) =>
          task.deadline &&
          dayjs(task.deadline).isBetween(startOfWeek, endOfWeek, "day", "[]")
      );
    } else if (newFilter === "month") {
      filtered = allTasks.filter(
        (task) =>
          task.deadline &&
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
    // Handle case when deadline is not set
    const deadline = task.deadline ? dayjs(task.deadline) : null;
    const tempTimeInput = deadline
      ? `${deadline.hour().toString().padStart(2, "0")}:${deadline
          .minute()
          .toString()
          .padStart(2, "0")}`
      : undefined;

    setForm({
      ...task,
      deadline,
      tempTimeInput,
    });
    setOpenDialog(true);
  };

  // Открытие и закрытие модального окна
  const handleOpenDialog = () => {
    // Reset form when opening for a new task
    setForm({
      title: "",
      duration: "",
      deadline: null, // Start with no due date
      status: "PLANNED",
      tempTimeInput: undefined,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTask(null);
  };

  // Обновление данных формы
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle date change
  const handleDeadlineChange = (newDate) => {
    // If no date was set or date is being cleared
    if (!newDate) {
      setForm({
        ...form,
        deadline: null,
        tempTimeInput: undefined,
      });
      return;
    }

    // If we have an existing date with time, preserve the time
    let updatedDate = newDate;
    let tempTime;

    if (form.deadline) {
      const existingTime = dayjs(form.deadline);
      updatedDate = newDate
        .hour(existingTime.hour())
        .minute(existingTime.minute());
      tempTime = `${existingTime
        .hour()
        .toString()
        .padStart(2, "0")}:${existingTime
        .minute()
        .toString()
        .padStart(2, "0")}`;
    } else {
      // Set a default time (noon) when selecting a date for the first time
      updatedDate = newDate.hour(12).minute(0);
      tempTime = "12:00";
    }

    setForm({
      ...form,
      deadline: updatedDate,
      tempTimeInput: tempTime,
    });
  };

  // Handle time change with manual input (24-hour format)
  const handleTimeInput = (e) => {
    const timeValue = e.target.value;

    // Allow empty values when field is cleared
    if (!timeValue) {
      return;
    }

    // Don't process further if no date is selected
    if (!form.deadline) return;

    try {
      // Allow partial input while typing (user is still typing)
      // This is a more lenient pattern for real-time validation

      // Handle special case when deleting/backspacing
      if (e.nativeEvent.inputType === "deleteContentBackward") {
        setForm({
          ...form,
          tempTimeInput: timeValue,
        });
        return;
      }

      // Auto-format input with colon
      let formattedValue = timeValue;

      // If user types 2 digits without colon, add it automatically
      if (timeValue.length === 2 && !timeValue.includes(":")) {
        formattedValue = timeValue + ":";
        e.target.value = formattedValue; // Update the input field value
      }

      // Store the partially typed value in form state
      setForm({
        ...form,
        tempTimeInput: formattedValue,
      });

      // Only update the actual time when input is complete and valid
      if (/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(formattedValue)) {
        const [hours, minutes] = formattedValue
          .split(":")
          .map((num) => parseInt(num, 10));

        // Create a copy of the current deadline date and set the time
        const newDeadline = dayjs(form.deadline)
          .hour(hours)
          .minute(minutes)
          .second(0);

        setForm({
          ...form,
          deadline: newDeadline,
          tempTimeInput: formattedValue,
        });
      }
    } catch (err) {
      console.error("Invalid time format", err);
    }
  };

  // Extract time from deadline for display in the time input field
  const getTimeString = () => {
    // If there's a partial input in progress, return that instead
    if (form.tempTimeInput !== undefined) {
      return form.tempTimeInput;
    }

    // Otherwise show the formatted time from the deadline
    if (!form.deadline) return "";
    const deadline = dayjs(form.deadline);
    return `${deadline.hour().toString().padStart(2, "0")}:${deadline
      .minute()
      .toString()
      .padStart(2, "0")}`;
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    try {
      // Create payload with the correct deadline field
      const taskData = {
        ...form,
        // Only include deadline if it's set
        ...(form.deadline && { deadline: dayjs(form.deadline).toISOString() }),
      };

      if (form.id) {
        await taskService.updateTask(form.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }
      await taskService.refreshTasks();
      handleCloseDialog();
    } catch (err) {
      console.error(t("tasks.errorSaving"), err);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("Deleting task with ID:", id);
      if (!id) {
        console.error("Cannot delete task: ID is undefined");
        return;
      }
      await taskService.deleteTask(id);
      await taskService.refreshTasks();
    } catch (err) {
      console.error(t("tasks.errorDeleting"), err);
      alert(t("tasks.errorDeleting") + ": " + err.message);
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

  // 🆕 Pomodoro timer handlers
  const handleStartPomodoro = (taskId) => {
    console.log("Starting Pomodoro for task ID:", taskId);
    if (!taskId) {
      console.error("Cannot start Pomodoro: Task ID is undefined");
      return;
    }
    setCurrentTaskId(taskId);
    setIsRunning(true);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setTimer(breakTime ? 300 : 1500);
  };

  // Function to format date and time for display
  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;
    return dayjs(dateTime).format("DD.MM.YYYY HH:mm");
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
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
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
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              borderRadius: 2,
            }}
          >
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
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {t("tasks.add")}
              </Button>
            </Stack>

            {/* Task Items - Only show due date if it exists */}
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Box
                  key={task._id}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1, sm: 0 },
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        color: theme.palette.text.primary,
                      }}
                    >
                      {task.title}
                    </Typography>
                    {task.deadline ? (
                      <Typography variant="body2" color="text.secondary">
                        {t("tasks.deadline")}: {formatDateTime(task.deadline)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("tasks.noDueDate")}
                      </Typography>
                    )}
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
                      label={t(
                        `tasks.${
                          task.status === "IN_PROGRESS"
                            ? "inProgress"
                            : task.status.toLowerCase()
                        }`
                      )}
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
                      onClick={() => {
                        const taskId = task._id || task.id;
                        if (!taskId) {
                          console.error("Task ID is undefined:", task);
                          alert("Cannot delete task: ID is missing");
                          return;
                        }
                        handleDelete(taskId);
                      }}
                      color="error"
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        const taskId = task._id || task.id;
                        if (!taskId) {
                          console.error(
                            "Task ID is undefined for Pomodoro:",
                            task
                          );
                          alert("Cannot start Pomodoro: Task ID is missing");
                          return;
                        }
                        handleStartPomodoro(taskId);
                      }}
                      color={
                        currentTaskId === (task._id || task.id)
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      {currentTaskId === (task._id || task.id) ? (
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
                sx={{
                  textAlign: "center",
                  my: 3,
                  color: theme.palette.text.secondary,
                }}
              >
                {t("tasks.noTasks")}
              </Typography>
            )}
          </Paper>

          {/* Pomodoro Timer */}
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom color="text.primary">
              {t("tasks.pomodoroTimer")}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")}
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
          </Paper>

          {/* Task Statistics Section */}
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.text.primary }}
            >
              {t("tasks.statistics")}
            </Typography>
            {/* ... Statistics content ... */}
          </Paper>
        </Container>
      </Box>

      {/* Add/Edit Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {editTask ? t("tasks.editTask") : t("tasks.addNewTask")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label={t("tasks.title")}
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                size="medium"
                autoFocus
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={t("tasks.duration")}
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                fullWidth
                size="medium"
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {t("tasks.minutes")}
                    </Typography>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>{t("tasks.status")}</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label={t("tasks.status")}
                  MenuProps={{
                    disablePortal: true,
                    disableScrollLock: true,
                    disableAutoFocusItem: true,
                  }}
                >
                  <MenuItem value="PLANNED">{t("tasks.planned")}</MenuItem>
                  <MenuItem value="IN_PROGRESS">
                    {t("tasks.inProgress")}
                  </MenuItem>
                  <MenuItem value="COMPLETED">{t("tasks.completed")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <TodayIcon sx={{ mr: 1 }} /> {t("tasks.deadlineSection")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t("tasks.deadlineCalendar")}
                  value={form.deadline}
                  onChange={handleDeadlineChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "medium",
                      placeholder: t("tasks.selectDate"),
                    },
                    popper: {
                      disablePortal: false,
                      placement: "bottom-start",
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 8],
                          },
                        },
                      ],
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t("tasks.deadlineTime")}
                placeholder="HH:MM"
                value={getTimeString()}
                onChange={handleTimeInput}
                disabled={!form.deadline}
                fullWidth
                size="medium"
                inputProps={{
                  maxLength: 5,
                  pattern: "[0-9]{2}:[0-9]{2}",
                  inputMode: "numeric",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon
                        color={form.deadline ? "primary" : "disabled"}
                      />
                    </InputAdornment>
                  ),
                }}
                helperText={
                  form.deadline ? t("tasks.timeFormat") : t("tasks.noDueDate")
                }
                FormHelperTextProps={{
                  sx: {
                    color:
                      form.tempTimeInput &&
                      !/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(
                        form.tempTimeInput
                      )
                        ? "error.main"
                        : "text.secondary",
                  },
                }}
              />
            </Grid>

            {form.deadline && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeIcon color="primary" />
                  <Typography>
                    {t("tasks.selectedDateTime")}:{" "}
                    {formatDateTime(form.deadline)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
