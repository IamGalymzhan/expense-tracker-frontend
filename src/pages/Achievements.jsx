import { useState, useEffect, useRef, lazy, Suspense } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Card,
  CardContent,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
  Modal,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import TopNav from "../components/TopNav";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SavingsIcon from "@mui/icons-material/Savings";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { achievementService } from "../services/achievementService";
import { useTheme as useMuiTheme } from "@mui/material/styles";

const AchievementModal = ({ achievement, open, onClose }) => {
  const { t } = useTranslation();
  if (!achievement) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="achievement-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            component="img"
            src={achievement.icon}
            alt={achievement.title}
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 500,
              color: "#000000",
            }}
          >
            {achievement.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            {achievement.description}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={onClose}
            sx={{
              borderRadius: 2,
              py: 1,
              textTransform: "none",
            }}
          >
            {t("achievements.close")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Lazy load the AchievementCard component
const LazyAchievementCard = ({
  achievement,
  isNew,
  onSelect,
  priority = false,
}) => {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const cardRef = useRef(null);

  useEffect(() => {
    if (priority) return; // Already loaded for priority items

    // Set up intersection observer to detect when card is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Load when within 200px of viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  return (
    <div ref={cardRef} style={{ width: "100%", height: "100%" }}>
      {shouldLoad ? (
        <AchievementCard
          achievement={achievement}
          isNew={isNew}
          onSelect={onSelect}
        />
      ) : (
        <SkeletonAchievementCard />
      )}
    </div>
  );
};

// Skeleton loading state for achievement cards
const SkeletonAchievementCard = () => {
  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          pt: "100%", // 1:1 Aspect ratio
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Skeleton variant="circular" width="60%" height="60%" />
        </Box>
      </Box>
      <CardContent sx={{ p: 1.5, textAlign: "center" }}>
        <Skeleton variant="text" width="80%" height={24} sx={{ mx: "auto" }} />
        <Skeleton
          variant="text"
          width="60%"
          height={16}
          sx={{ mx: "auto", mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};

const AchievementCard = ({ achievement, isNew = false, onSelect }) => {
  const { t } = useTranslation();
  const isUnlocked = achievement.unlocked;
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  const getRequirementText = (requirements) => {
    if (!requirements || !requirements.type) {
      return "";
    }

    const type = requirements.type.toLowerCase();

    switch (type) {
      case "expense_count":
        return t("achievements.requirements.expenseCount", {
          count: requirements.count,
        });
      case "expense_streak":
        return t("achievements.requirements.expenseStreak", {
          days: requirements.days,
        });
      case "budget_accuracy":
        return t("achievements.requirements.budgetAccuracy", {
          threshold: requirements.threshold,
        });
      case "perfect_balance":
        return t("achievements.requirements.perfectBalance");
      case "income_exceeds_expenses":
        return t("achievements.requirements.incomeExceedsExpenses", {
          months: requirements.months,
        });
      case "expense_reduction":
        return t("achievements.requirements.expenseReduction", {
          percentage: requirements.percentage,
        });
      case "zero_expense_day":
        return t("achievements.requirements.zeroExpenseDay");
      case "task_completed":
        return t("achievements.requirements.taskCompleted", {
          count: requirements.count,
        });
      case "task_streak":
        return t("achievements.requirements.taskStreak", {
          days: requirements.days,
        });
      case "deadline_met":
        return t("achievements.requirements.deadlineMet");
      case "fast_task_completion":
        return t("achievements.requirements.fastTaskCompletion", {
          minutes: requirements.minutes,
        });
      case "tasks_per_day":
        return t("achievements.requirements.tasksPerDay", {
          count: requirements.count,
        });
      case "tasks_per_week":
        return t("achievements.requirements.tasksPerWeek", {
          count: requirements.count,
        });
      case "tasks_per_month":
        return t("achievements.requirements.tasksPerMonth", {
          count: requirements.count,
        });
      case "tasks_completion_rate":
        return t("achievements.requirements.tasksCompletionRate", {
          percentage: requirements.percentage,
        });
      case "tasks_completion_rate_day":
        return t("achievements.requirements.tasksCompletionRateDay", {
          percentage: requirements.percentage,
        });
      case "deadline_streak_month":
        return t("achievements.requirements.deadlineStreakMonth", {
          percentage: requirements.percentage,
        });
      default:
        return "";
    }
  };

  const handleClick = () => {
    if (isUnlocked) {
      onSelect(achievement);
    }
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for achievement: ${achievement.title}`);
    setImageError(true);
  };

  const renderAchievementIcon = () => {
    // Use image if available and hasn't errored
    if (achievement.imagePath && !imageError) {
      return (
        <Box
          component="img"
          src={achievement.imagePath}
          alt={achievement.title}
          onError={handleImageError}
          sx={{
            width: "60%",
            height: "60%",
            objectFit: "contain",
            filter: isUnlocked ? "none" : "grayscale(100%)",
            opacity: isUnlocked ? 1 : 0.5,
          }}
        />
      );
    }

    // Fallback to emoji
    return (
      <Typography
        variant="h1"
        sx={{
          fontSize: "4rem",
          opacity: isUnlocked ? 1 : 0.5,
        }}
      >
        {achievement.icon}
      </Typography>
    );
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: isUnlocked ? "scale(1.02)" : "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          pt: "100%", // 1:1 Aspect ratio
        }}
      >
        {isNew && (
          <Chip
            label={t("achievements.new")}
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 1,
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          {renderAchievementIcon()}
        </Box>
      </Box>
      <CardContent sx={{ p: 1.5, textAlign: "center" }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 500,
            color: isUnlocked ? "text.primary" : "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          {achievement.title}
        </Typography>
        {!isUnlocked && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              {achievement.progress}% {t("achievements.progress")}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={achievement.progress}
              sx={{ mt: 1, height: 4, borderRadius: 2 }}
            />
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                mt: 1,
                fontSize: "0.7rem",
              }}
            >
              {getRequirementText(achievement.requirements)}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/* Commenting out PersonalRecord component as it's not ready yet
const PersonalRecord = ({ icon, value, label }) => {
  const getIcon = () => {
    // Use emoji instead of image
    return (
      <Typography variant="h1" sx={{ fontSize: "2.5rem" }}>
        {icon}
      </Typography>
    );
  };

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        {getIcon()}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};
*/

const Achievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useMuiTheme();
  const [achievements, setAchievements] = useState({ financial: [], time: [] });
  const [achievementProgress, setAchievementProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    // Set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Only fetch once to prevent request spam
    if (!hasFetched.current) {
      fetchAchievements();
      hasFetched.current = true;
    }
  }, []);

  const fetchAchievements = async (forceRefresh = false) => {
    try {
      if (loading && hasFetched.current && !forceRefresh) return; // Prevent duplicate requests while loading

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Add a timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      // Race between the actual request and the timeout
      const achievementsData = await Promise.race([
        achievementService.getAchievements(forceRefresh),
        timeoutPromise,
      ]);

      // Only update state if component is still mounted
      if (isMounted.current) {
        setAchievements(achievementsData || { financial: [], time: [] });

        try {
          const progressData = await achievementService.getProgress(
            forceRefresh
          );
          if (isMounted.current) {
            setAchievementProgress(progressData);
          }
        } catch (progressError) {
          console.error("Error fetching achievement progress:", progressError);
        }

        setLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);

      // Only update state if component is still mounted
      if (isMounted.current) {
        setError(error.message || "Failed to load achievements");
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchAchievements(true);
  };

  const handleAchievementSelect = (achievement) => {
    setSelectedAchievement(achievement);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Combine financial and time achievements into a single array
  const allAchievements = [
    ...(achievements.financial || []),
    ...(achievements.time || []),
  ];
  const unlockedAchievements = allAchievements.filter((a) => a.unlocked);
  const lockedAchievements = allAchievements.filter((a) => !a.unlocked);

  // Comment out personal records data
  /*
  const records = [
    {
      icon: "💰", // Expense icon
      value: achievementProgress?.expenses?.total || 0,
      label: t("expenses.title"),
    },
    {
      icon: "💼", // Income icon
      value: achievementProgress?.income?.total || 0,
      label: t("incomes.title"),
    },
    {
      icon: "🏦", // Savings icon
      value: achievementProgress?.savings?.total || 0,
      label: t("dashboard.savings"),
    },
    {
      icon: "🔥", // Streak icon
      value: achievementProgress?.streak?.max || 0,
      label: t("achievements.progress"),
    },
  ];
  */

  return (
    <Box>
      <TopNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : "#f8fafc",
          minHeight: "100vh",
          fontFamily:
            "'Roboto', 'Noto Sans', 'Open Sans', 'Inter', 'Source Sans Pro', sans-serif",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading ? (
            <Box sx={{ width: "100%", mt: 4 }}>
              <LinearProgress />
              <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
                {t("achievements.loading")}
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="error">
                {error}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => {
                  hasFetched.current = false;
                  fetchAchievements(true);
                }}
              >
                {t("common.retry")}
              </Button>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: "bold", mb: 0 }}
                >
                  {t("achievements.title")}
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  startIcon={refreshing ? <CircularProgress size={20} /> : null}
                >
                  {refreshing
                    ? t("achievements.refreshing")
                    : t("achievements.refresh")}
                </Button>
              </Box>

              {/* Comment out Personal Records section
              <Typography
                variant="h5"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold" }}
              >
                {t("achievements.personalRecords")}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {records.map((record, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <PersonalRecord
                      icon={record.icon}
                      value={record.value}
                      label={record.label}
                    />
                  </Grid>
                ))}
              </Grid>
              */}

              <Typography
                variant="h5"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold" }}
              >
                {t("achievements.unlockedAchievements")}
                <Chip
                  label={unlockedAchievements.length}
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>

              {unlockedAchievements.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", my: 4, color: "text.secondary" }}
                >
                  {t("achievements.noAchievements")}
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {unlockedAchievements.map((achievement) => (
                    <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                      <LazyAchievementCard
                        achievement={achievement}
                        isNew={false}
                        onSelect={handleAchievementSelect}
                        priority={true}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              <Typography
                variant="h5"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold" }}
              >
                {t("achievements.lockedAchievements")}
                <Chip
                  label={lockedAchievements.length}
                  color="secondary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>

              {lockedAchievements.length === 0 ? (
                <Typography
                  sx={{ textAlign: "center", my: 4, color: "text.secondary" }}
                >
                  {t("achievements.noAchievements")}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {lockedAchievements.map((achievement) => (
                    <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                      <LazyAchievementCard
                        achievement={achievement}
                        isNew={false}
                        onSelect={handleAchievementSelect}
                        priority={false}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {selectedAchievement && (
                <AchievementModal
                  achievement={selectedAchievement}
                  open={modalOpen}
                  onClose={handleModalClose}
                />
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Achievements;
