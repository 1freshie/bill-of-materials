import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Позволява изпращането на httpOnly бисквитките
});

// Интерсептор за глобална обработка на грешки
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
