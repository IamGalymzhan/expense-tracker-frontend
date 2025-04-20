import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TaskIcon from "@mui/icons-material/Task";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TopNav from "../components/TopNav";
import { useTranslation } from "react-i18next";
import { useTheme as useMuiTheme } from "@mui/material/styles";

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function for tab a11y props
function a11yProps(index) {
  return {
    id: `help-tab-${index}`,
    "aria-controls": `help-tabpanel-${index}`,
  };
}

const Help = () => {
  const { t } = useTranslation();
  const theme = useMuiTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            {t("help.title")}
          </Typography>

          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight="bold"
            >
              {t("help.welcome")}
            </Typography>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="help page tabs"
            >
              <Tab
                icon={<InfoIcon />}
                label={t("help.overview")}
                {...a11yProps(0)}
              />
              <Tab
                icon={<DashboardIcon />}
                label={t("navigation.dashboard")}
                {...a11yProps(1)}
              />
              <Tab
                icon={<MoneyOffIcon />}
                label={t("navigation.expenses")}
                {...a11yProps(2)}
              />
              <Tab
                icon={<AttachMoneyIcon />}
                label={t("navigation.incomes")}
                {...a11yProps(3)}
              />
              <Tab
                icon={<TaskIcon />}
                label={t("navigation.tasks")}
                {...a11yProps(4)}
              />
              <Tab
                icon={<EmojiEventsIcon />}
                label={t("navigation.achievements")}
                {...a11yProps(5)}
              />
              <Tab
                icon={<LightbulbIcon />}
                label={t("navigation.tips")}
                {...a11yProps(6)}
              />
            </Tabs>
          </Box>

          {/* Overview Section */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("help.aboutApp")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.appDescription")}
            </Typography>

            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("help.mainFeatures")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DashboardIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.dashboard")}
                        secondary={t("help.dashboardDescription")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyOffIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.expenses")}
                        secondary={t("help.expensesDescription")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoneyIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.incomes")}
                        secondary={t("help.incomesDescription")}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TaskIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.tasks")}
                        secondary={t("help.tasksDescription")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmojiEventsIcon sx={{ color: "orange" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.achievements")}
                        secondary={t("help.achievementsDescription")}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TipsAndUpdatesIcon sx={{ color: "purple" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("navigation.tips")}
                        secondary={t("help.tipsDescription")}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="h6" gutterBottom>
              {t("help.gettingStarted")}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>1.</ListItemIcon>
                <ListItemText primary={t("help.startStep1")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>2.</ListItemIcon>
                <ListItemText primary={t("help.startStep2")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>3.</ListItemIcon>
                <ListItemText primary={t("help.startStep3")} />
              </ListItem>
              <ListItem>
                <ListItemIcon>4.</ListItemIcon>
                <ListItemText primary={t("help.startStep4")} />
              </ListItem>
            </List>
          </TabPanel>

          {/* Dashboard Section */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.dashboard")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.dashboardIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.overviewSection")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.overviewDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("help.totalExpensesExplanation")}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.totalIncomeExplanation")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.balanceExplanation")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.chartsSection")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.chartsDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.incomeExpenseChart")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.timeStatisticsChart")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.recentActivities")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.recentActivitiesDescription")}
                </Typography>
                <Typography variant="body2">
                  {t("help.recentActivitiesTip")}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* Expenses Section */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.expenses")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.expensesIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.addingExpenses")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.addingExpensesDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>1.</ListItemIcon>
                    <ListItemText primary={t("help.expenseStep1")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>2.</ListItemIcon>
                    <ListItemText primary={t("help.expenseStep2")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>3.</ListItemIcon>
                    <ListItemText primary={t("help.expenseStep3")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>4.</ListItemIcon>
                    <ListItemText primary={t("help.expenseStep4")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.viewingExpenseStats")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.viewingExpenseStatsDescription")}
                </Typography>
                <Typography variant="body2">
                  {t("help.expenseStatsTip")}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.exportingExpenses")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.exportingExpensesDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.exportExcel")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.emailReport")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* Incomes Section */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.incomes")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.incomesIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.addingIncomes")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.addingIncomesDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>1.</ListItemIcon>
                    <ListItemText primary={t("help.incomeStep1")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>2.</ListItemIcon>
                    <ListItemText primary={t("help.incomeStep2")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>3.</ListItemIcon>
                    <ListItemText primary={t("help.incomeStep3")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>4.</ListItemIcon>
                    <ListItemText primary={t("help.incomeStep4")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.viewingIncomeStats")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.viewingIncomeStatsDescription")}
                </Typography>
                <Typography variant="body2">
                  {t("help.incomeStatsTip")}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.categoryManagement")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.categoryManagementDescription")}
                </Typography>
                <Typography variant="body2">{t("help.categoryTip")}</Typography>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* Tasks Section */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.tasks")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.tasksIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.creatingTasks")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.creatingTasksDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>1.</ListItemIcon>
                    <ListItemText primary={t("help.taskStep1")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>2.</ListItemIcon>
                    <ListItemText primary={t("help.taskStep2")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>3.</ListItemIcon>
                    <ListItemText primary={t("help.taskStep3")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>4.</ListItemIcon>
                    <ListItemText primary={t("help.taskStep4")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.managingTasks")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.managingTasksDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.taskStatus")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.taskDeadline")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.taskCompletion")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.taskFiltering")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.taskFilteringDescription")}
                </Typography>
                <Typography variant="body2">
                  {t("help.taskFilteringTip")}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* Achievements Section */}
          <TabPanel value={tabValue} index={5}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.achievements")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.achievementsIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.achievementTypes")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.achievementTypesDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.financialAchievements")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.timeAchievements")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.unlockingAchievements")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.unlockingAchievementsDescription")}
                </Typography>
                <Typography variant="body2">
                  {t("help.achievementTip")}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.achievementRecords")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.achievementRecordsDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.personalRecords")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* Tips Section */}
          <TabPanel value={tabValue} index={6}>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              {t("navigation.tips")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("help.tipsIntro")}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.financialTips")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.financialTipsDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.budgetingTip")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.savingTip")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.timeTips")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.timeTipsDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.taskManagementTip")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.productivityTip")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("help.bestPractices")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {t("help.bestPracticesDescription")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.dailyPractice")} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("help.reviewPractice")} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </TabPanel>
        </Container>

        {/* Frequently Asked Questions */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            fontWeight="bold"
          >
            {t("help.faq")}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("help.faq1")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{t("help.faqAnswer1")}</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("help.faq2")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{t("help.faqAnswer2")}</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("help.faq3")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{t("help.faqAnswer3")}</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("help.faq4")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{t("help.faqAnswer4")}</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("help.faq5")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{t("help.faqAnswer5")}</Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Contact Support */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            fontWeight="bold"
          >
            {t("help.contactSupport")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("help.contactInfo")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("help.supportEmail")}: support@expensetracker.com
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Help;
