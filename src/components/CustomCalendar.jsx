import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Modal,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/kk"; // Kazakh locale
import { useTranslation } from "react-i18next";

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const MONTHS = [
  "Қаңтар",
  "Ақпан",
  "Наурыз",
  "Сәуір",
  "Мамыр",
  "Маусым",
  "Шілде",
  "Тамыз",
  "Қыркүйек",
  "Қазан",
  "Қараша",
  "Желтоқсан",
];

const TaskModal = ({ open, onClose, date, tasks, t }) => {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="task-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: theme.palette.background.paper,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          id="task-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
        >
          {dayjs(date).format("D MMMM YYYY")}
        </Typography>
        <List>
          {tasks.map((task, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={task.title}
                secondary={`${t("tasks.deadline")}: ${task.deadline}`}
                sx={{
                  "& .MuiListItemText-primary": {
                    color:
                      task.status === "COMPLETED"
                        ? "success.main"
                        : "text.primary",
                  },
                }}
              />
              <Chip
                label={t(`tasks.${task.status.toLowerCase()}`)}
                color={
                  task.status === "COMPLETED"
                    ? "success"
                    : task.status === "IN_PROGRESS"
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};

const CustomCalendar = ({ tasks = [], onDateSelect }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const handlePrevYear = () => {
    setCurrentDate(currentDate.subtract(1, "year"));
  };

  const handleNextYear = () => {
    setCurrentDate(currentDate.add(1, "year"));
  };

  const getTasksForDate = (date) => {
    // Ensure tasks is an array
    if (!Array.isArray(tasks)) {
      return [];
    }

    return tasks.filter(
      (task) =>
        dayjs(task.deadline).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateTasks = getTasksForDate(date);
    if (dateTasks.length > 0) {
      setModalOpen(true);
    }
    onDateSelect(date);
  };

  const renderCalendar = () => {
    const firstDay = currentDate.startOf("month");
    const daysInMonth = currentDate.daysInMonth();
    const startingDay = firstDay.day() === 0 ? 6 : firstDay.day() - 1;

    const days = [];
    let day = 1;

    // Previous month days
    const prevMonth = currentDate.subtract(1, "month");
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        currentMonth: false,
        date: prevMonth.date(prevMonthDays - i),
      });
    }

    // Current month days
    while (day <= daysInMonth) {
      const date = currentDate.date(day);
      const dayTasks = getTasksForDate(date);
      days.push({
        day,
        currentMonth: true,
        date,
        tasks: dayTasks,
      });
      day++;
    }

    // Next month days
    let nextDay = 1;
    while (days.length % 7 !== 0) {
      days.push({
        day: nextDay,
        currentMonth: false,
        date: currentDate.add(1, "month").date(nextDay),
      });
      nextDay++;
    }

    return days;
  };

  const getMonthName = (monthIndex) => {
    const monthKeys = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    return t(`dashboard.${monthKeys[monthIndex]}`);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 3 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        overflow: "hidden", // Prevent overflow on small screens
      }}
    >
      <Box
        sx={{
          mb: { xs: 1.5, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 1 } }}
        >
          <IconButton
            onClick={handlePrevYear}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <KeyboardDoubleArrowLeft fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handlePrevMonth}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            color: theme.palette.primary.main,
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            textAlign: "center",
            whiteSpace: { xs: "normal", sm: "nowrap" },
          }}
        >
          {getMonthName(currentDate.month())} {currentDate.year()}
        </Typography>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 1 } }}
        >
          <IconButton
            onClick={handleNextMonth}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleNextYear}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <KeyboardDoubleArrowRight fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1, md: 1.5 },
          mb: { xs: 1, sm: 2 },
        }}
      >
        {WEEKDAYS.map((day) => (
          <Typography
            key={day}
            sx={{
              textAlign: "center",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
              color: theme.palette.text.secondary,
              py: { xs: 0.5, sm: 1 },
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1, md: 1.5 },
        }}
      >
        {renderCalendar().map((dateObj, index) => {
          const dateTasks = dateObj.tasks || [];
          const hasMoreTasks = dateTasks.length > 0;
          const hasSingleTask = dateTasks.length === 1;
          const hasMultipleTasks = dateTasks.length > 1;

          return (
            <Box
              key={index}
              onClick={() => handleDateClick(dateObj.date)}
              sx={{
                p: { xs: 0.5, sm: 1, md: 1.5 },
                border: "1px solid",
                borderColor: dateObj.currentMonth
                  ? theme.palette.divider
                  : "transparent",
                borderRadius: 2,
                cursor: "pointer",
                opacity: dateObj.currentMonth ? 1 : 0.4,
                backgroundColor: dateObj.currentMonth
                  ? theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : theme.palette.background.paper
                  : "transparent",
                transition: "all 0.2s ease-in-out",
                minHeight: { xs: "60px", sm: "80px", md: "100px" },
                display: "flex",
                flexDirection: "column",
                position: "relative",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1.1rem" },
                  fontWeight: dateObj.currentMonth ? 500 : 400,
                  color: dateObj.currentMonth
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                }}
              >
                {dateObj.day}
              </Typography>

              {hasSingleTask && (
                <Box
                  sx={{
                    mt: "auto",
                    backgroundColor: (theme) => {
                      const status = dateTasks[0].status;
                      return theme.palette.mode === "dark"
                        ? status === "COMPLETED"
                          ? theme.palette.success.dark
                          : status === "IN_PROGRESS"
                          ? theme.palette.warning.dark
                          : theme.palette.info.dark
                        : status === "COMPLETED"
                        ? theme.palette.success.light
                        : status === "IN_PROGRESS"
                        ? theme.palette.warning.light
                        : theme.palette.info.light;
                    },
                    color: theme.palette.getContrastText(
                      theme.palette.mode === "dark"
                        ? theme.palette.info.dark
                        : theme.palette.info.light
                    ),
                    borderRadius: 1,
                    px: { xs: 0.5, sm: 1 },
                    py: 0.5,
                    position: "absolute",
                    bottom: { xs: 2, sm: 8 },
                    left: { xs: 2, sm: 8 },
                    right: { xs: 2, sm: 8 },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.6rem", sm: "0.75rem" },
                      display: "block",
                    }}
                  >
                    {dateTasks[0].title}
                  </Typography>
                </Box>
              )}

              {hasMultipleTasks && (
                <Box
                  sx={{
                    mt: "auto",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                    color: theme.palette.text.secondary,
                    borderRadius: 1,
                    px: { xs: 0.5, sm: 1 },
                    py: 0.5,
                    position: "absolute",
                    bottom: { xs: 2, sm: 8 },
                    right: { xs: 2, sm: 8 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.6rem", sm: "0.75rem" },
                    }}
                  >
                    + {dateTasks.length}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        tasks={selectedDate ? getTasksForDate(selectedDate) : []}
        t={t}
      />
    </Paper>
  );
};

export default CustomCalendar;
