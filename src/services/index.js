import authService from "./authService";
import expenseService from "./expenseService";
import incomeService from "./incomeService";
import statsService from "./statsService";
import taskService from "./taskService";
import achievementService from "./achievementService";
import budgetService from "./budgetService";
import userService from "./userService";
import categoryService from "./categoryService";
import notificationService from "./notificationService";

export {
  authService,
  expenseService,
  incomeService,
  statsService,
  taskService,
  achievementService,
  budgetService,
  userService,
  categoryService,
  notificationService,
};

// Example of how to use these services:
/*
import { expenseService } from '../services';

// In a component
const fetchExpenses = async () => {
  try {
    const expenses = await expenseService.getExpenses({ 
      startDate: '2023-01-01', 
      endDate: '2023-12-31' 
    });
    // Do something with expenses
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
};
*/
