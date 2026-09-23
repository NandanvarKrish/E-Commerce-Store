export const APP_ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  COLLECTIONS: "/collections",
  CART: "/cart",
  CHECKOUT: "/checkout",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    CUSTOMERS: "/admin/customers",
    SETTINGS: "/admin/settings",
  },
} as const;

export const STORAGE_KEYS = {
  THEME: "theme",
  CART: "cart_storage",
} as const;
