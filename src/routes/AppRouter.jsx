import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import Incomes from "../pages/Incomes";
import Tasks from "../pages/Tasks";
import Tips from "../pages/Tips";
import Settings from "../pages/Settings";
import Achievements from "../pages/Achievements";
import Notifications from "../pages/Notifications";
import Help from "../pages/Help";
import { LanguageProvider } from "../context/LanguageContext";

const AppRouter = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default AppRouter;
