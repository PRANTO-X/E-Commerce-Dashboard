import Cookies from "js-cookie";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const COOKIE_KEYS = {
  TOKEN: "auth_token",
  USER: "user_data",
  ROLE: "user_role",
  OWNER: "owner_id",
} as const;

// Token management
export const setToken = (token: string): void => {
  Cookies.set(COOKIE_KEYS.TOKEN, `Token ${token}`, COOKIE_OPTIONS);
};

export const getToken = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.TOKEN);
};

export const removeToken = (): void => {
  Cookies.remove(COOKIE_KEYS.TOKEN, { path: "/" });
};

// User data management
export const setUserData = <T>(userData: T): void => {
  Cookies.set(COOKIE_KEYS.USER, JSON.stringify(userData), COOKIE_OPTIONS);
};

export const getUserData = <T>(): T | null => {
  const userData = Cookies.get(COOKIE_KEYS.USER);
  return userData ? (JSON.parse(userData) as T) : null;
};

export const removeUserData = (): void => {
  Cookies.remove(COOKIE_KEYS.USER, { path: "/" });
};

// Role management
export const setUserRole = (role: string): void => {
  Cookies.set(COOKIE_KEYS.ROLE, role, COOKIE_OPTIONS);
};

export const getUserRole = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.ROLE);
};

export const removeUserRole = (): void => {
  Cookies.remove(COOKIE_KEYS.ROLE, { path: "/" });
};

// Owner ID management
export const setOwnerId = (ownerId: string): void => {
  Cookies.set(COOKIE_KEYS.OWNER, ownerId, COOKIE_OPTIONS);
};

export const getOwnerId = (): string | undefined => {
  return Cookies.get(COOKIE_KEYS.OWNER);
};

export const removeOwnerId = (): void => {
  Cookies.remove(COOKIE_KEYS.OWNER, { path: "/" });
};

// Clear all auth cookies
export const clearAllAuthCookies = (): void => {
  Object.values(COOKIE_KEYS).forEach((key) => {
    Cookies.remove(key, { path: "/" });
  });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: token } : {};
};
