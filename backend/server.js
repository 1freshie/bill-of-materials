import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();
const PORT = 5000;

// Сигурност на HTTP хедърите
app.use(helmet());

// CORS настройка (Позволява комуникация само с фронтенда и разрешава бисквитки)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true 
}));

// Парсване на JSON и Бисквитки
app.use(express.json());
app.use(cookieParser());

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
