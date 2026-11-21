import prisma from '../prisma/prisma.client.js';

/**
 * GET /api/products
 * Връща списък с всички изделия.
 */
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.pRODUCT.findMany({
      orderBy: {
        PRODUCT_ID: 'asc',
      },
    });

    res.json(products);
  } catch (error) {
    console.error('Грешка при извличане на изделия:', error);
    res.status(500).json({ error: 'Сървърна грешка при извличане на изделия.' });
  }
};

/**
 * GET /api/products/:id
 * Връща детайли за конкретно изделие.
 */
export const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Невалиден код на изделие.' });
    }

    const product = await prisma.pRODUCT.findUnique({
      where: { PRODUCT_ID: productId },
      include: {
        BOM: {
          include: {
            MATERIALS: true,
          },
        },
        OTHER_EXPENCES: {
          include: {
            EXPENCES: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Изделието не е намерено.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Грешка при извличане на детайли за изделие:', error);
    res.status(500).json({ error: 'Сървърна грешка при извличане на детайли.' });
  }
};

/**
 * POST /api/products
 * Регистрира ново изделие, спецификация (BOM) и разходи.
 */
export const createProduct = async (req, res) => {
  try {
    const { PRODUCT_ID, PRODUCT_NAME, PRODUCT_DESCRIPTION, materials, expenses } = req.body;

    const productIdNum = Number(PRODUCT_ID);
    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({ error: 'Кодът на изделието е задължителен и трябва да бъде число.' });
    }

    if (!PRODUCT_NAME || !PRODUCT_NAME.trim()) {
      return res.status(400).json({ error: 'Наименованието на изделието е задължително.' });
    }

    // Проверка за уникалност на ID
    const existingId = await prisma.pRODUCT.findUnique({
      where: { PRODUCT_ID: productIdNum },
    });
    if (existingId) {
      return res.status(400).json({ error: 'Изделие с такъв код вече съществува.' });
    }

    // Проверка за уникалност на наименование
    const existingName = await prisma.pRODUCT.findFirst({
      where: {
        PRODUCT_NAME: PRODUCT_NAME.trim(),
      },
    });
    if (existingName) {
      return res.status(400).json({ error: 'Изделие с такова наименование вече съществува.' });
    }

    // Изпълнение в транзакция
    const result = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.pRODUCT.create({
        data: {
          PRODUCT_ID: productIdNum,
          PRODUCT_NAME: PRODUCT_NAME.trim(),
          PRODUCT_DESCRIPTION: PRODUCT_DESCRIPTION ? PRODUCT_DESCRIPTION.trim() : null,
        },
      });

      if (Array.isArray(materials) && materials.length > 0) {
        await tx.bOM.createMany({
          data: materials.map((m) => ({
            PRODUCT_ID: productIdNum,
            MATERIAL_ID: Number(m.MATERIAL_ID),
            BOM_QTY: Number(m.BOM_QTY),
          })),
        });
      }

      if (Array.isArray(expenses) && expenses.length > 0) {
        await tx.oTHER_EXPENCES.createMany({
          data: expenses.map((e) => ({
            PRODUCT_ID: productIdNum,
            EXPENCE_ID: Number(e.EXPENCE_ID),
            EXPRENCE_VALUE: Number(e.EXPRENCE_VALUE),
          })),
        });
      }

      return newProduct;
    });

    res.status(201).json({ message: 'Изделието е създадено успешно.', product: result });
  } catch (error) {
    console.error('Грешка при създаване на изделие:', error);
    res.status(500).json({ error: 'Сървърна грешка при запис на изделието.' });
  }
};