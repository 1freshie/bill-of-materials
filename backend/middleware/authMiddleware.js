import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  // 1. Взимаме токена от заглавката Authorization: Bearer <token>
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Достъпът е отказан. Липсва токен." });
  }

  // 2. Отделяме самия токен от думата 'Bearer '
  const token = authHeader.split(" ")[1];

  try {
    // 3. Декодираме и верифицираме токена с нашия таен ключ
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Закачаме дешифрираните данни (напр. userId) към заявката (req)
    req.user = decoded;

    // 5. Позволяваме на заявката да продължи към същинския контролер
    next();
  } catch (error) {
    return res.status(403).json({ error: "Невалиден или изтекъл токен." });
  }
}
