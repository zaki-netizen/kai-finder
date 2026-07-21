import { create } from 'zustand';
import { authAPI } from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // Track if auth has been initialized
  error: null,

  // Initialize from localStorage and validate token with API
  init: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Try to validate token with API
        try {
          const response = await authAPI.getMe();
          const validUser = response.data.data;

          // Update user data from API
          localStorage.setItem('user', JSON.stringify(validUser));

          set({
            token,
            user: validUser,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch (apiError) {
          // Token invalid or expired, try refresh
          if (refreshToken) {
            try {
              const refreshResponse = await authAPI.refresh(refreshToken);
              const { accessToken, refreshToken: newRefreshToken, user: refreshedUser } = refreshResponse.data.data;

              localStorage.setItem('token', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              localStorage.setItem('user', JSON.stringify(refreshedUser));

              set({
                token: accessToken,
                user: refreshedUser,
                isAuthenticated: true,
                isInitialized: true,
              });
            } catch (refreshError) {
              // Refresh failed, clear everything
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isInitialized: true,
              });
            }
          } else {
            // No refresh token, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isInitialized: true,
            });
          }
        }
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens and user
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      set({
        isLoading: false,
        error: message,
      });
      return { success: false, message };
    }
  },

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authAPI.register(data);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens and user
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      const errors = error.response?.data?.errors;

      set({
        isLoading: false,
        error: message,
      });

      return { success: false, message, errors };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue logout even if API fails
    }

    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Get current user from API
  fetchUser: async () => {
    try {
      const response = await authAPI.getMe();
      const user = response.data.data;

      localStorage.setItem('user', JSON.stringify(user));

      set({ user });

      return user;
    } catch (error) {
      // If fetching user fails, logout
      get().logout();
      return null;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data;

      localStorage.setItem('user', JSON.stringify(updatedUser));

      set({ user: updatedUser, isLoading: false });

      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Update profile gagal.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
