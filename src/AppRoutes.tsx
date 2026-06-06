import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import TasksPage from "@/pages/tasks/TasksPage";
import RecurringTasksPage from "@/pages/recurring-tasks/RecurringTasksPage";
import ProtectedRoute from "@/ProtectedRoute";
import { useAuth } from "@/auth/AuthContext";

export default function AppRoutes() {
  const { accessToken } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={accessToken ? "/tasks" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={accessToken ? <Navigate to="/tasks" replace /> : <LoginPage />}
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recurring-tasks"
        element={
          <ProtectedRoute>
            <RecurringTasksPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}