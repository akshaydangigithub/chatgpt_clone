import { create } from "zustand";

interface UIState {
  /** Desktop sidebar collapsed state. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  /** Mobile sidebar (Sheet) open state. */
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
}));
