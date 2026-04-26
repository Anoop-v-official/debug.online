import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
  theme: 'dark';
  setTheme: (t: 'dark') => void;
}

export const useThemeStore = create<State>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'debug.online:theme' },
  ),
);
