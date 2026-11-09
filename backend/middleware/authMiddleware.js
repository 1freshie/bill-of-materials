import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const token = req.cookies.token; // Взимаме токена директно от бисквитките

  if (!token) {
    return res
      .status(401)
      .json({ error: "Достъпът е отказан. Не сте влезли в профила си." });
  }

  try {
    // Декодираме и верифицираме токена с нашия таен ключ
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Закачаме дешифрираните данни (напр. userId) към заявката (req)
    req.user = decoded;

    // Позволяваме на заявката да продължи към същинския контролер
    next();
  } catch (error) {
    res.clearCookie("token"); // Ако токенът е невалиден, го изтриваме
    return res.status(403).json({ error: "Невалиден или изтекъл токен." });
  }
}
