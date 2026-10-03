/**
 * Frontend Auth Helpers
 * Used in Client Components for state management
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "admin";
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  // Set cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
};

export const setUser = (user: AuthUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Clear cookies as well for middleware
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
};

export const isFarmer = (): boolean => {
  const user = getUser();
  return user?.role === "farmer";
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "admin";
};