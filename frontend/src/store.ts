import { create } from "zustand";

interface GlobalState {
  refresh: boolean; // Global refresh state
  toggleRefresh: () => void; // Function to toggle the refresh state
  setRefresh: (value: boolean) => void; // Function to set the refresh state to a specific value
}

const useGlobalStore = create<GlobalState>((set) => ({
  refresh: false, // Initial state
  toggleRefresh: () => set((state) => ({ refresh: !state.refresh })), // Toggles the value
  setRefresh: (value: boolean) => set(() => ({ refresh: value })), // Sets a specific value
}));

export default useGlobalStore;
