
import { useEffect, useState } from "react";
import {
  Alert, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField
} from "@mui/material";

import api from "../api/axiosConfig";

export default function MaterialPriceDialog({
  open, material, onClose, onSaved
}) {
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [error, setError] = useState("");

  useEffect(() => {
    setPrice("");
    setDate(new Date().toLocaleDateString("en-CA"));
    setError("");
  }, [open, material]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0 || !date) {
      setError("Въведи валидна цена и дата.");
      return;
    }

    try {
      await api.post(`/materials/${material.MATERIAL_ID}/prices`, {
        PRICE_PRICE: Number(price),
        PRICE_DATE: date
      });

      onClose();
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при запис на цената.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Нова цена</DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {material?.MATERIAL_NAME}
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            margin="normal"
            label="Цена"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Отказ</Button>
          <Button type="submit" variant="contained">Запази цена</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
