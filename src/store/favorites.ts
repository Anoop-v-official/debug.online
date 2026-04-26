import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
}

export const useFavoritesStore = create<State>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [slug, ...s.slugs],
        })),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: 'debug.online:favorites' },
  ),
);
