import { create } from "zustand";

interface UserState {
  userName: string | null;
  userId: string | null;
  userType: string | null;
  pracIsLoggedin: string | null;
  userEmailId: string | null;
  userMobile: string | null;
  jwtToken: string | null;
  setUser: (user: Partial<UserState>) => void;
  reset: () => void;
  isProfileUpdated: string | null; // 'Y', 'N', or null
  setIsProfileUpdated: (status: string | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  userName: null,
  userId: null,
  userType: null,
  pracIsLoggedin: null,
  userEmailId: null,
  userMobile: null,
  jwtToken: null,
  setUser: (user) => set(user),
  reset: () =>
    set({
      userName: null,
      userId: null,
      userType: null,
      pracIsLoggedin: null,
      userEmailId: null,
      userMobile: null,
      jwtToken: null,
    }),
  isProfileUpdated: null,
  setIsProfileUpdated: (status) => set({ isProfileUpdated: status }),
}));
