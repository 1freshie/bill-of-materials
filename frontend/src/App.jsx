import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Пренасочваме началната страница към логин екрана */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Страница за вход/регистрация */}
        <Route path="/auth" element={<Auth />} />

        {/* Защитена страница (Dashboard) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
