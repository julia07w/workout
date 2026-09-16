import { createNeonAuth } from "@neondatabase/auth/next/server";

export const isNeonAuthConfigured = Boolean(
  process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET,
);

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? "https://not-configured.invalid/auth",
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ??
      "development-placeholder-secret-change-me-now",
  },
});

