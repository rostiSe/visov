import { create } from 'zustand'

const useFilterStore = create((set) => ({
  search: "",
  setSearch: (search: string) => set({ search }),
}))

export default useFilterStore