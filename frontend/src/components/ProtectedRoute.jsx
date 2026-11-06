import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Ако няма токен, пренасочваме към страницата за вход/регистрация
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Ако има токен, показваме заявения компонент (напр. Dashboard)
  return children;
}
