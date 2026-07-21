import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      isDark: false,

      toggle: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme, isDark: newTheme === 'dark' });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      setTheme: (theme) => {
        set({ theme, isDark: theme === 'dark' });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      init: () => {
        const { theme } = get();
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    {
      name: 'kai-finder-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
