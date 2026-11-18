
import prisma from "../prisma/prisma.client.js";

// GET /api/expenses - Списък с всички разходи
export async function getExpenses(req, res) {
  try {
    const expenses = await prisma.eXPENCES.findMany({
      orderBy: {
        EXPENCE_ID: "asc",
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error("Грешка при извличане на разходи:", error);
    res.status(500).json({ error: "Грешка при зареждане на разходите." });
  }
}

// POST /api/expenses - Добавяне на нов разход
export async function createExpense(req, res) {
  try {
    const { EXPENCE_ID, EXPENCE_NAME } = req.body;

    const id = Number(EXPENCE_ID);
    const name = String(EXPENCE_NAME || "").trim();

    if (!Number.isSafeInteger(id) || id <= 0 || !name) {
      return res.status(400).json({
        error: "Въведи валидно ID и наименование.",
      });
    }

    if (name.length > 20) {
      return res.status(400).json({
        error: "Наименованието може да бъде максимум 20 символа.",
      });
    }

    const existing = await prisma.eXPENCES.findFirst({
      where: {
        OR: [
          { EXPENCE_ID: id },
          { EXPENCE_NAME: name },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Разход с такова ID или наименование вече съществува.",
      });
    }

    const expense = await prisma.eXPENCES.create({
      data: {
        EXPENCE_ID: id,
        EXPENCE_NAME: name,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Грешка при добавяне на разход:", error);
    res.status(500).json({ error: "Грешка при създаване на разхода." });
  }
}
