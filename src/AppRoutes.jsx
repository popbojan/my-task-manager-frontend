import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
