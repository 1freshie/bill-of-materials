import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 5000;

app.use(express.json());

// Регистриране на раутовете (Всички ще започват с /api/auth)
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
