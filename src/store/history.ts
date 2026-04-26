import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Entry {
  slug: string;
  at: number;
}

interface State {
  entries: Entry[];
  record: (slug: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<State>()(
  persist(
    (set) => ({
      entries: [],
      record: (slug) =>
        set((s) => {
          const filtered = s.entries.filter((e) => e.slug !== slug);
          return { entries: [{ slug, at: Date.now() }, ...filtered].slice(0, 12) };
        }),
      clear: () => set({ entries: [] }),
    }),
    { name: 'debug.online:history' },
  ),
);
