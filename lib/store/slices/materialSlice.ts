import { addMaterialFromFile as addMaterialFromFileAPI } from '@/hooks/add-materials';
import { fetchMaterials } from '@/lib/api/materials';
import { StoreSlice, MaterialSlice } from './types';
import { resolveBackendBookId } from '../utils/backend';

export const createMaterialSlice: StoreSlice<MaterialSlice> = (set, get) => ({
  materials: {},
  activeMaterialIds: [],
  setActiveMaterialIds: (ids) => set({ activeMaterialIds: ids }),
  addMaterial: (bookId, material) => set((state) => ({
    materials: {
      ...state.materials,
      [bookId]: [...(state.materials[bookId] || []), material]
    }
  })),
  addMaterialFromFile: async (bookId, file) => {
    try {
      const backendBookId = await resolveBackendBookId(bookId, get().books);
      if (!backendBookId) {
        console.warn('Cannot upload material because the book does not exist in backend yet.');
        return;
      }

      const material = await addMaterialFromFileAPI(file, backendBookId);
      set((state) => ({
        materials: {
          ...state.materials,
          [bookId]: [...(state.materials[bookId] || []), material]
        }
      }));
    } catch (error) {
      console.error('Failed to add material from file:', error);
      throw error;
    }
  },
  loadMaterialsFromBackend: async (bookId) => {
    try {
      const backendBookId = await resolveBackendBookId(bookId, get().books);
      if (!backendBookId) {
        console.warn('Backend book id could not be resolved. Skipping material load.');
        return;
      }

      const materials = await fetchMaterials(backendBookId);
      set((state) => ({
        materials: {
          ...state.materials,
          [bookId]: materials
        }
      }));
    } catch (error) {
      console.error('Error loading materials from backend:', error);
    }
  },
  deleteMaterial: (bookId, materialId) => set((state) => ({
    materials: {
      ...state.materials,
      [bookId]: (state.materials[bookId] || []).filter((m) => m.id !== materialId)
    }
  }))
});
