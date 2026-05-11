export function getInternalApiBaseUrl() {
  if (process.env.INTERNAL_API_BASE_URL) return process.env.INTERNAL_API_BASE_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
