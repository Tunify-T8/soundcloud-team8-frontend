const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// When using mock data we want requests to stay local (relative URL) so our interceptor can intercept them.
export const BASE_URL = USE_MOCK
  ? ''
  : import.meta.env.VITE_REAL_API_URL;