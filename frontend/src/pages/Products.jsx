import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Container,
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../api/axiosConfig";
import ProductDialog from "../components/ProductDialog";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Грешка при зареждане.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    return [
      p.PRODUCT_ID,
      p.PRODUCT_NAME,
      p.PRODUCT_DESCRIPTION
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    );
  });

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
          <Typography variant="h4">Изделия</Typography>
          
        </Box>

        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          + Добави изделие
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="Търсене по код, наименование или описание"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Typography sx={{ mt: 1 }} color="text.secondary">
          Намерени изделия: {filteredProducts.length}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Наименование</TableCell>
              <TableCell>Описание</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Няма намерени изделия.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={String(p.PRODUCT_ID)} hover>
                  <TableCell>{String(p.PRODUCT_ID)}</TableCell>
                  <TableCell>{p.PRODUCT_NAME}</TableCell>
                  <TableCell>{p.PRODUCT_DESCRIPTION || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={loadProducts}
      />
    </Container>
  );
}