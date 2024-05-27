import { create, SetState, StateCreator } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Instances } from '../API/Model/InstancesModel';

/**
 * Active Instance
 */

type ActiveInstanceState = {
  instance: Instances | null;
  addInstance: (item: Instances) => void;
  clearInstance: () => void;
};

const activeInstanceStore: StateCreator<ActiveInstanceState> = (
  set: SetState<ActiveInstanceState>
) => ({
  instance: null as Instances | null,
  addInstance: (item: Instances) => {
    set(() => ({
      instance: item,
    }));
  },
  clearInstance: () => set({ instance: null }),
});

const useActiveInstanceStore = create<ActiveInstanceState>()(
  devtools(
    persist(activeInstanceStore, {
      name: 'activeInstance',
    })
  )
);

export default useActiveInstanceStore;
