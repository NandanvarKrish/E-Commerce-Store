import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isAdminSidebarCollapsed: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
  toggleAdminSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isAdminSidebarCollapsed: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setAdminSidebarCollapsed: (collapsed) => set({ isAdminSidebarCollapsed: collapsed }),
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
}));
