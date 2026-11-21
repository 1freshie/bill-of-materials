import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import Expenses from "./pages/Expenses";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
