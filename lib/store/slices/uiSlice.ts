import { StoreSlice, UiSlice } from './types';

export const createUiSlice: StoreSlice<UiSlice> = (set) => ({
  ui: {
    leftTab: 'files',
    rightTab: 'dict',
    rightSubTab: 'upload',
    rightPanelOpen: false
  },
  setLeftTab: (tab) => set((state) => ({ ui: { ...state.ui, leftTab: tab } })),
  setRightTab: (tab) => set((state) => ({ ui: { ...state.ui, rightTab: tab } })),
  setRightSubTab: (tab) => set((state) => ({ ui: { ...state.ui, rightSubTab: tab } })),
  setRightPanelOpen: (open) => set((state) => ({ ui: { ...state.ui, rightPanelOpen: open } }))
});
