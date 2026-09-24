import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isAdminSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  isFilterDrawerOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
  toggleAdminSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
  setFilterDrawerOpen: (open: boolean) => void;
  toggleFilterDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isAdminSidebarCollapsed: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  isFilterDrawerOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setAdminSidebarCollapsed: (collapsed) => set({ isAdminSidebarCollapsed: collapsed }),
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),
  toggleFilterDrawer: () => set((state) => ({ isFilterDrawerOpen: !state.isFilterDrawerOpen })),
}));
