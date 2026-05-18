import axios from "axios";

// ─── Development এ localhost, Production এ render.com ───────
// Vite এ import.meta.env.DEV → local এ true, build এ false
const baseURL = import.meta.env.DEV
  ? "http://localhost:3000"                              // local dev
  : "https://book-management-system-ks6w.onrender.com"; // production

const api = axios.create({ baseURL });

export default api;