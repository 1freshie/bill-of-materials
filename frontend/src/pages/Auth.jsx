import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { user, login, register } = useAuth();

  // State за превключване между Вход и Регистрация
  const [isLogin, setIsLogin] = useState(true);

  // State за полетата във формата
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State за обработка на грешки и зареждане
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: 3,
          padding: 4,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h5">
          {isLogin ? "Вход в системата" : "Регистрация"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Имейл адрес"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Парола"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? "Зареждане..." : isLogin ? "Вход" : "Регистрирай ме"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={toggleAuthMode}
              sx={{ textDecoration: "none" }}
            >
              {isLogin
                ? "Нямате профил? Създайте си нов"
                : "Вече имате профил? Влезте тук"}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
