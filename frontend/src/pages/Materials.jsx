
import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Container,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from "@mui/material";

import api from "../api/axiosConfig";
import MaterialDialog from "../components/MaterialDialog";
import MaterialPriceDialog from "../components/MaterialPriceDialog";
import { useNavigate } from "react-router-dom";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [priceMaterial, setPriceMaterial] = useState(null);
  const navigate = useNavigate();

  // Зареждане на материалите
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/materials");
      setMaterials(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при зареждане.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Бърз филтър
  const filteredMaterials = materials.filter((m) => {
    const query = search.toLowerCase();

    return [
      m.MATERIAL_ID,
      m.MATERIAL_NAME,
      m.MATERIAL_DESCRIPTION
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    );
  });

  // Добавяне
  const handleAdd = () => {
    setSelectedMaterial(null);
    setDialogOpen(true);
  };

  // Редактиране
  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
          <Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/dashboard")}
            sx={{ mb: 1 }}
          >
            ← Назад към Табло
          </Button>
          <Typography variant="h4">Материали</Typography>
          
        </Box>

        <Button variant="contained" onClick={handleAdd}>
          + Добави материал
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Търсене по код, наименование или характеристики"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Typography sx={{ mt: 1 }} color="text.secondary">
          Намерени материали: {filteredMaterials.length}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Наименование</TableCell>
              <TableCell>Характеристики</TableCell>
              <TableCell>Мярка</TableCell>
              <TableCell>Последна цена</TableCell>
              <TableCell>Изделия</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Няма намерени материали.
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((m) => {
                const used = Number(m._count?.BOM || 0);
                const price = m.PRICE_LIST?.[0]?.PRICE_PRICE;

                return (
                  <TableRow key={String(m.MATERIAL_ID)}>
                    <TableCell>{String(m.MATERIAL_ID)}</TableCell>
                    <TableCell>{m.MATERIAL_NAME}</TableCell>
                    <TableCell>{m.MATERIAL_DESCRIPTION || "—"}</TableCell>
                    <TableCell>{m.MATERIAL_MEASURE || "—"}</TableCell>
                    <TableCell>
                      {price != null ? Number(price).toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>{used}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        disabled={used > 0}
                        onClick={() => handleEdit(m)}
                      >
                        Редакция
                      </Button>

                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => setPriceMaterial(m)}
                      >
                        Нова цена
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MaterialDialog
        open={dialogOpen}
        material={selectedMaterial}
        onClose={() => setDialogOpen(false)}
        onSaved={loadMaterials}
      />

      <MaterialPriceDialog
        open={Boolean(priceMaterial)}
        material={priceMaterial}
        onClose={() => setPriceMaterial(null)}
        onSaved={loadMaterials}
      />
    </Container>
  );
}
