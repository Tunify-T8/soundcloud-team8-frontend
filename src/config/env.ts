const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const REAL_API_URL =
  import.meta.env.VITE_REAL_API_URL ?? import.meta.env.VITE_API_URL;

export const BASE_URL = USE_MOCK
  ? import.meta.env.VITE_MOCK_API_URL
  : REAL_API_URL;
