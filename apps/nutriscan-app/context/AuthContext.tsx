import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, useSegments } from "expo-router";
import { api, setAuthToken, clearAuthToken, getAuthToken } from "../api/client";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (token: string, userData: any, redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const fetchProfile = useCallback(async () => {
    try {
      console.log("Auth: Fetching profile...");
      const response = await api.get("/users/profile");
      console.log("Auth: Profile fetched success");
      console.log("Auth: Raw API Response Data:", JSON.stringify(response.data.data, null, 2));
      
      // Transform backend profile data to match app structure
      // Backend returns Profile which contains .user
      // App expects User which contains .profile
      const profileData = response.data.data;
      if (profileData) {
        const fullUser = {
          ...profileData.user, // name, email, avatar
          id: profileData.userId,
          profile: profileData,
          avatar: profileData.user?.avatar // Explicitly ensure avatar is at top level
        };
        console.log("Auth: Transformed User Object:", JSON.stringify(fullUser, null, 2));
        setUser(fullUser);
        return fullUser;
      }
      
      setUser(response.data.data);
      return response.data.data;
    } catch (e) {
      console.log("Auth: Profile fetch failed", e);
      // Don't clear token on simple fetch failure, might be network
      // await clearAuthToken(); 
      // setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      console.log("Auth: Starting loadUser...");
      try {
        const token = await getAuthToken();
        console.log("Auth: Token from storage:", token ? "PRESENT" : "MISSING");
        
        if (token) {
          // Set in-memory token (redundant but safe)
          await setAuthToken(token);
          await fetchProfile();
        } else {
          console.log("Auth: No token found, user remains null");
        }
      } catch (e) {
        console.log("Auth: Error loading user/token", e);
      } finally {
        console.log("Auth: Loading finished");
        setIsLoading(false);
      }
    };

    loadUser();
  }, [fetchProfile]);

  const signIn = async (token: string, userData: any, redirectPath: string = "/(tabs)") => {
    console.log("[SignIn] Saving token...");
    await setAuthToken(token);
    // Verify token was saved
    const savedToken = await getAuthToken();
    console.log("[SignIn] Token verified saved:", !!savedToken);
    
    // Set user immediately
    console.log("[SignIn] Setting user state:", JSON.stringify(userData, null, 2));
    setUser(userData);
    
    if (redirectPath) {
      router.replace(redirectPath as any);
    }
  };

  const signOut = async () => {
    try {
      console.log("[SignOut] Starting sign out...");
      await clearAuthToken();
      console.log("[SignOut] Token cleared");
      setUser(null);
      console.log("[SignOut] User set to null, redirecting...");
      router.replace("/onboarding/welcome");
    } catch (e) {
      console.log("[SignOut] Error:", e);
    }
  };

  const 
  refreshProfile = async () => {
    const user = await fetchProfile();
    if (!user) {
        console.log("Auth: Refresh failed to get user");
        // Optionally handle token expiration here if needed
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
