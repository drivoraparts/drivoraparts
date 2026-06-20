import { create } from "zustand";

type ToastMessage = {
  id: number;
  text: string;
};

type ToastState = {
  toasts: ToastMessage[];
  showToast: (text: string) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (text) => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, text }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 2500);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const showToast = (text: string) => {
  useToastStore.getState().showToast(text);
};
