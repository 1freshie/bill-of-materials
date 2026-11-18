
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/axiosConfig";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Зареждане на разходите
  const loadExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при зареждане.");
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Добавяне на нов разход
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/expenses", {
        EXPENCE_ID: Number(id),
        EXPENCE_NAME: name.trim(),
      });

      setOpen(false);
      setId("");
      setName("");
      setSuccess("Разходът е добавен успешно.");

      await loadExpenses();
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при добавяне.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Номенклатура на разходи
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Преглед и добавяне на видове разходи
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setOpen(true)}
      >
        + Добави разход
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Наименование</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Няма регистрирани разходи.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={String(expense.EXPENCE_ID)} hover>
                  <TableCell>{String(expense.EXPENCE_ID)}</TableCell>
                  <TableCell>{expense.EXPENCE_NAME}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Добавяне на разход</DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              required
              margin="normal"
              label="ID на разход"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />

            <TextField
              fullWidth
              required
              margin="normal"
              label="Наименование"
              inputProps={{ maxLength: 20 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>
              Отказ
            </Button>

            <Button type="submit" variant="contained">
              Добави
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
