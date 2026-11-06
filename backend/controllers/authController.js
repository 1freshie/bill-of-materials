import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.client.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Валидация: Проверяваме дали са подадени имейл и парола
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Имейлът и паролата са задължителни." });
    }

    // 2. Търсене на потребителя по имейл
    const user = await prisma.uSER.findUnique({
      where: { EMAIL: email },
    });

    // Ако няма такъв потребител, връщаме грешка 401 (Unauthorized)
    if (!user) {
      return res.status(401).json({ error: "Грешен имейл или парола." });
    }

    // 3. Проверка на паролата (сравнява въведената с криптираната в базата)
    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Грешен имейл или парола." });
    }

    // 4. Генериране на JWT токен (валиден за 2 часа)
    const token = jwt.sign(
      { userId: user.ID, email: user.EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    // 5. Успешен отговор (Връщаме токена и данните без паролата)
    res.json({
      message: "Успешен вход",
      token: token,
      user: {
        id: user.ID,
        email: user.EMAIL,
        created_at: user.CREATED_AT,
        updated_at: user.UPDATED_AT,
      },
    });
  } catch (error) {
    console.error("Грешка при вход:", error);
    res.status(500).json({ error: "Възникна сървърна грешка." });
  }
}

export async function register(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Валидация
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Имейлът и паролата са задължителни." });
    }

    // 2. Проверка дали потребителят вече съществува
    const existingUser = await prisma.uSER.findUnique({
      where: { EMAIL: email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Потребител с този имейл вече съществува." });
    }

    // 3. Хеширане (криптиране) на паролата
    // Числото 10 са "солевите кръгове" (salt rounds) - стандартна и сигурна стойност
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Създаване на новия потребител в базата данни
    const newUser = await prisma.uSER.create({
      data: {
        EMAIL: email,
        PASSWORD: hashedPassword,
      },
    });

    // 5. Директно вписване (генериране на токен), за да не се налага
    // потребителят да се логва ръчно веднага след регистрация
    const token = jwt.sign(
      { userId: newUser.ID, email: newUser.EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    // 6. Връщане на отговор без хешираната парола
    res.status(201).json({
      message: "Успешна регистрация!",
      token: token,
      user: {
        id: newUser.ID,
        email: newUser.EMAIL,
        createdAt: newUser.CREATED_AT,
      },
    });
  } catch (error) {
    console.error("Грешка при регистрация:", error);
    res
      .status(500)
      .json({ error: "Възникна сървърна грешка при регистрацията." });
  }
}
