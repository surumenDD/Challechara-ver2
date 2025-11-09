import { StoreSlice, SourceSlice } from './types';

export const createSourceSlice: StoreSlice<SourceSlice> = (set) => ({
  episodes: {},
  activeSourceIds: [],
  setActiveSourceIds: (ids) => set({ activeSourceIds: ids }),
  addEpisode: (bookId, episode) => set((state) => ({
    episodes: {
      ...state.episodes,
      [bookId]: [...(state.episodes[bookId] || []), episode]
    }
  })),
  updateEpisode: (bookId, episode) => set((state) => ({
    episodes: {
      ...state.episodes,
      [bookId]: (state.episodes[bookId] || []).map((e) =>
        e.id === episode.id ? episode : e
      )
    }
  })),
  deleteEpisode: (bookId, episodeId) => set((state) => ({
    episodes: {
      ...state.episodes,
      [bookId]: (state.episodes[bookId] || []).filter((e) => e.id !== episodeId)
    }
  }))
});
