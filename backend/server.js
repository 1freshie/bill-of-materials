import express from "express";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();
const PORT = 5000;

app.use(express.json());

// Регистриране на раутовете (Всички ще започват с /api/auth)
app.use("/api/auth", authRoutes);

// Защитен роут, който изисква валиден токен
app.get('/api/dashboard', verifyToken, (req, res) => {
  // Тъй като минахме през verifyToken, имаме достъп до req.user
  res.json({ 
    message: 'Успешен достъп!',
    userEmail: req.user.email // Връщаме имейла, скрит в токена
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
