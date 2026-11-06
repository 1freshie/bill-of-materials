import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Логика за изход
  const handleLogout = () => {
    localStorage.removeItem("token"); // Изтриваме токена
    navigate("/auth"); // Пренасочваме към входа
  };

  // Изпълнява се при зареждане на компонента
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Правим GET заявка към защитения роут, като изпращаме токена в Headers
        const response = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          // Ако токенът е изтекъл или невалиден, изритваме потребителя
          handleLogout();
          return;
        }

        const result = await response.json();
        setData(result);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Неуспешна връзка със сървъра.");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{ mt: 8, textAlign: "center", p: 4, boxShadow: 2, borderRadius: 2 }}
      >
        <Typography variant="h4" gutterBottom>
          Табло (Dashboard)
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        {!data && !error ? (
          <CircularProgress /> // Показва спинър, докато се зареждат данните
        ) : (
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" color="primary">
              {data?.message}
            </Typography>
            <Typography variant="body1">
              Влезли сте като: {data?.userEmail}
            </Typography>
          </Box>
        )}

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Изход
        </Button>
      </Box>
    </Container>
  );
}
