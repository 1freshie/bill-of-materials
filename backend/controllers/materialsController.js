import prisma from "../prisma/prisma.client.js";

// GET /api/materials - Извличане и търсене
export async function getMaterials(req, res) {
  try {
    const { id, name, description } = req.query;

    // Изграждаме филтър обекта динамично въз основа на подадените параметри
    const whereClause = {};

    // Тъй като MATERIAL_ID е Decimal в базата, го парсваме до число при търсене
    if (id) whereClause.MATERIAL_ID = { equals: Number(id) };
    if (name) whereClause.MATERIAL_NAME = { contains: name }; // Поддържа частично съвпадение (търсачка)
    if (description)
      whereClause.MATERIAL_DESCRIPTION = { contains: description };

    // Извличаме материалите и броим колко пъти се срещат в BOM (с колко изделия са свързани)
    const materials = await prisma.mATERIALS.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { BOM: true }, // Връща число в полето _count.BOM
        },
      },
    });

    res.json(materials);
  } catch (error) {
    console.error("Грешка при извличане на материали:", error);
    res.status(500).json({ error: "Грешка при извличане на данните." });
  }
}

// GET /api/materials/:id - Детайли за конкретен материал
export async function getMaterialById(req, res) {
  try {
    const id = Number(req.params.id);

    const material = await prisma.mATERIALS.findUnique({
      where: { MATERIAL_ID: id },
      include: {
        PRICE_LIST: {
          orderBy: { PRICE_DATE: "desc" }, // Подреждаме историята на цените от най-новата
        },
        BOM: {
          include: {
            PRODUCT: true, // Извличаме пълните данни за изделието, в което се използва
          },
        },
      },
    });

    if (!material)
      return res.status(404).json({ error: "Материалът не е намерен." });

    res.json(material);
  } catch (error) {
    console.error("Грешка при извличане на детайли:", error);
    res.status(500).json({ error: "Грешка при извличане на данните." });
  }
}

// POST /api/materials - Създаване на нов материал
export async function createMaterial(req, res) {
  try {
    const {
      MATERIAL_ID,
      MATERIAL_NAME,
      MATERIAL_DESCRIPTION,
      MATERIAL_MEASURE,
      PRICE_PRICE,
    } = req.body;

    if (!MATERIAL_ID || !MATERIAL_NAME || PRICE_PRICE === undefined) {
      return res.status(400).json({ error: "ID, Име и Цена са задължителни." });
    }

    // Проверка за уникалност
    const existingMaterial = await prisma.mATERIALS.findFirst({
      where: {
        OR: [
          { MATERIAL_ID: Number(MATERIAL_ID) },
          { MATERIAL_NAME: MATERIAL_NAME },
        ],
      },
    });

    if (existingMaterial) {
      return res
        .status(400)
        .json({ error: "Материал с такъв Код или Име вече съществува." });
    }

    // Създаваме материала и едновременно с това записваме първата му цена
    const newMaterial = await prisma.mATERIALS.create({
      data: {
        MATERIAL_ID: Number(MATERIAL_ID),
        MATERIAL_NAME,
        MATERIAL_DESCRIPTION,
        MATERIAL_MEASURE,
        PRICE_LIST: {
          create: {
            PRICE_PRICE: Number(PRICE_PRICE),
            PRICE_DATE: new Date(), // Записваме текущата дата
          },
        },
      },
    });

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Грешка при създаване:", error);
    res.status(500).json({ error: "Грешка при създаване на материала." });
  }
}

// PUT /api/materials/:id - Редакция с блокираща логика
export async function updateMaterial(req, res) {
  try {
    const id = Number(req.params.id);
    const { MATERIAL_NAME, MATERIAL_DESCRIPTION, MATERIAL_MEASURE } = req.body;

    // Проверяваме дали материалът участва в поне една спецификация (BOM)
    const bomEntries = await prisma.bOM.count({
      where: { MATERIAL_ID: id },
    });

    if (bomEntries > 0) {
      return res.status(403).json({
        error:
          "Редакцията е забранена. Този материал вече е включен в спецификация на изделие.",
      });
    }

    // Ако не се използва никъде, продължаваме с редакцията
    const updatedMaterial = await prisma.mATERIALS.update({
      where: { MATERIAL_ID: id },
      data: {
        MATERIAL_NAME,
        MATERIAL_DESCRIPTION,
        MATERIAL_MEASURE,
      },
    });

    res.json(updatedMaterial);
  } catch (error) {
    console.error("Грешка при редакция:", error);
    res.status(500).json({ error: "Грешка при обновяване на материала." });
  }
}

// POST /api/materials/:id/prices - Добавяне на цена
export async function addMaterialPrice(req, res) {
  try {
    const id = Number(req.params.id);
    const { PRICE_PRICE, PRICE_DATE } = req.body;

    if (PRICE_PRICE === undefined || !PRICE_DATE) {
      return res.status(400).json({ error: "Цена и Дата са задължителни." });
    }

    const newPrice = await prisma.pRICE_LIST.create({
      data: {
        MATERIAL_ID: id,
        PRICE_PRICE: Number(PRICE_PRICE),
        PRICE_DATE: new Date(PRICE_DATE), // Очакваме валиден ISO Date string от фронтенда
      },
    });

    res.status(201).json(newPrice);
  } catch (error) {
    console.error("Грешка при добавяне на цена:", error);
    res.status(500).json({ error: "Грешка при запис на новата цена." });
  }
}
