import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Взимаме тайните данни (Бисквитката се прикачва автоматично от Axios)
    api
      .get("/dashboard")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{ mt: 8, textAlign: "center", p: 4, boxShadow: 2, borderRadius: 2 }}
      >
        <Typography variant="h4" gutterBottom>
          Табло (Dashboard)
        </Typography>
        <Typography variant="h6" color="primary">
          {message}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Влезли сте като: <strong>{user?.email}</strong>
        </Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Изход
        </Button>
      </Box>
    </Container>
  );
}
