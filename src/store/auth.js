import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth as authApi } from '../api/endpoints';

// Persisted into localStorage under "vps-auth" — the axios interceptor reads
// the same key so requests stay authenticated across reloads.
export const useAuth = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const data = await authApi.login({ email, password });
        set({
          token: data.token,
          user: {
            id: data.userId,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
          },
        });
        return data;
      },

      register: async (payload) => {
        const data = await authApi.register(payload);
        set({
          token: data.token,
          user: {
            id: data.userId,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
          },
        });
        return data;
      },

      logout: () => set({ token: null, user: null }),
    }),
    { name: 'vps-auth' },
  ),
);

export const homePathFor = (role) => {
  if (role === 'Admin') return '/admin';
  if (role === 'Staff') return '/staff';
  return '/customer';
};
