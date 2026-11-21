import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, InputLabel, MenuItem,
  Select, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography
} from "@mui/material";

import api from "../api/axiosConfig";

const emptyForm = {
  PRODUCT_ID: "",
  PRODUCT_NAME: "",
  PRODUCT_DESCRIPTION: "",
};

export default function ProductDialog({ open, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableExpenses, setAvailableExpenses] = useState([]);

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // При отваряне зареждаме номенклатурите и нулираме формата
  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setSelectedMaterials([]);
      setSelectedExpenses([]);
      setError("");

      api.get("/materials")
        .then((res) => setAvailableMaterials(res.data))
        .catch(console.error);

      api.get("/expenses")
        .then((res) => setAvailableExpenses(res.data))
        .catch(console.error);
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ------------------- Логика за Материали (BOM) -------------------
  const handleAddMaterialRow = () => {
    setSelectedMaterials([
      ...selectedMaterials,
      { MATERIAL_ID: "", BOM_QTY: "1", unitPrice: "0" }
    ]);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...selectedMaterials];
    updated[index][field] = value;

    // При избор на материал, по подразбиране вземаме актуалната цена от ценовата му листа
    if (field === "MATERIAL_ID") {
      const mat = availableMaterials.find((m) => String(m.MATERIAL_ID) === String(value));
      const defaultPrice = mat?.PRICE_LIST?.[0]?.PRICE_PRICE || 0;
      updated[index].unitPrice = String(defaultPrice);
    }

    setSelectedMaterials(updated);
  };

  const handleRemoveMaterialRow = (index) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  // ------------------- Логика за Други разходи -------------------
  const handleAddExpenseRow = () => {
    setSelectedExpenses([
      ...selectedExpenses,
      { EXPENCE_ID: "", EXPRENCE_VALUE: "0" }
    ]);
  };

  const handleExpenseChange = (index, field, value) => {
    const updated = [...selectedExpenses];
    updated[index][field] = value;
    setSelectedExpenses(updated);
  };

  const handleRemoveExpenseRow = (index) => {
    setSelectedExpenses(selectedExpenses.filter((_, i) => i !== index));
  };

  // ------------------- Запис на Изделието -------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.PRODUCT_NAME.trim()) {
      setError("Наименованието на изделието е задължително.");
      return;
    }

    const id = Number(form.PRODUCT_ID);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Въведи валиден код на изделие.");
      return;
    }

    const data = {
      PRODUCT_ID: id,
      PRODUCT_NAME: form.PRODUCT_NAME.trim(),
      PRODUCT_DESCRIPTION: form.PRODUCT_DESCRIPTION.trim() || null,
      materials: selectedMaterials
        .filter((m) => m.MATERIAL_ID && Number(m.BOM_QTY) > 0)
        .map((m) => ({
          MATERIAL_ID: Number(m.MATERIAL_ID),
          BOM_QTY: Number(m.BOM_QTY)
        })),
      expenses: selectedExpenses
        .filter((e) => e.EXPENCE_ID && Number(e.EXPRENCE_VALUE) >= 0)
        .map((e) => ({
          EXPENCE_ID: Number(e.EXPENCE_ID),
          EXPRENCE_VALUE: Number(e.EXPRENCE_VALUE)
        }))
    };

    try {
      setSaving(true);
      await api.post("/products", data);

      onClose();
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при запис на изделието.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Регистрация на ново изделие</DialogTitle>

        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            margin="normal"
            label="Код"
            name="PRODUCT_ID"
            type="number"
            value={form.PRODUCT_ID}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Наименование"
            name="PRODUCT_NAME"
            value={form.PRODUCT_NAME}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Описание"
            name="PRODUCT_DESCRIPTION"
            multiline
            rows={2}
            value={form.PRODUCT_DESCRIPTION}
            onChange={handleChange}
          />

          <Divider sx={{ my: 3 }} />

          {/* Спецификация на материали (BOM) */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Необходими материали</Typography>
            <Button size="small" variant="outlined" onClick={handleAddMaterialRow}>
              + Добави материал
            </Button>
          </Box>

          {selectedMaterials.length > 0 && (
            <Table size="small" sx={{ mb: 3 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Материал</TableCell>
                  <TableCell width="130">Количество</TableCell>
                  <TableCell width="140">Ед. цена (лв.)</TableCell>
                  <TableCell width="130">Общо (лв.)</TableCell>
                  <TableCell width="60"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMaterials.map((row, index) => {
                  const qty = Number(row.BOM_QTY) || 0;
                  const price = Number(row.unitPrice) || 0;
                  const rowTotal = qty * price;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel>Избери материал</InputLabel>
                          <Select
                            value={row.MATERIAL_ID}
                            label="Избери материал"
                            onChange={(e) => handleMaterialChange(index, "MATERIAL_ID", e.target.value)}
                          >
                            {availableMaterials.map((m) => (
                              <MenuItem key={String(m.MATERIAL_ID)} value={m.MATERIAL_ID}>
                                {m.MATERIAL_NAME} ({m.MATERIAL_MEASURE || "бр."})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          slotProps={{ htmlInput: { min: 0.001, step: "0.001" } }}
                          value={row.BOM_QTY}
                          onChange={(e) => handleMaterialChange(index, "BOM_QTY", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                          value={row.unitPrice}
                          onChange={(e) => handleMaterialChange(index, "unitPrice", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>{rowTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button color="error" size="small" onClick={() => handleRemoveMaterialRow(index)}>
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Други разходи */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">Други разходи</Typography>
            <Button size="small" variant="outlined" onClick={handleAddExpenseRow}>
              + Добави разход
            </Button>
          </Box>

          {selectedExpenses.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Вид разход</TableCell>
                  <TableCell width="180">Стойност (лв.)</TableCell>
                  <TableCell width="60"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedExpenses.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Избери разход</InputLabel>
                        <Select
                          value={row.EXPENCE_ID}
                          label="Избери разход"
                          onChange={(e) => handleExpenseChange(index, "EXPENCE_ID", e.target.value)}
                        >
                          {availableExpenses.map((ex) => (
                            <MenuItem key={String(ex.EXPENCE_ID)} value={ex.EXPENCE_ID}>
                              {ex.EXPENCE_NAME}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                        value={row.EXPRENCE_VALUE}
                        onChange={(e) => handleExpenseChange(index, "EXPRENCE_VALUE", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button color="error" size="small" onClick={() => handleRemoveExpenseRow(index)}>
                        X
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={saving}>Отказ</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Записване..." : "Запази"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}