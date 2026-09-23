export const siteConfig = {
  name: "Aura & Earth",
  description: "Modern organic luxury goods and mindful lifestyle essentials.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Catalog", href: "/products" },
    { title: "Collections", href: "/collections" },
    { title: "About", href: "/about" },
  ],
  adminNav: [
    { title: "Overview", href: "/admin", icon: "LayoutDashboard" },
    { title: "Products", href: "/admin/products", icon: "Package" },
    { title: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
    { title: "Customers", href: "/admin/customers", icon: "Users" },
    { title: "Settings", href: "/admin/settings", icon: "Settings" },
  ],
  links: {
    github: "https://github.com/NandanvarKrish/E-Commerce-Store",
  },
};

export type SiteConfig = typeof siteConfig;
