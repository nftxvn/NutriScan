import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Replace this with your computer's IP address if running on a physical device
const LOCAL_IP = "192.168.1.2"; 

// For Android Emulator, use 10.0.2.2. For iOS Simulator, use localhost.
// For Physical Device, use LOCAL_IP.
const BASE_URL = `http://${LOCAL_IP}:3000/api`; 
// If using Emulator, uncomment below:
// const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";

// In-memory token fallback for Expo Go issues
let inMemoryToken: string | null = null;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // Fail after 5 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token
api.interceptors.request.use(async (config) => {
  try {
    let token = await getAuthToken();
    console.log("[API Interceptor] Token present:", !!token);
    
    // Don't send token for auth endpoints
    if (config.url && config.url.includes("/auth/")) {
       return config;
    }

    // If token exists and header is not already set, add it
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log("Error reading token", error);
  }
  return config;
});

// Safe Storage Abstraction
const tokenStorage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error("Local Storage setItem failed:", e);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (e) {
        console.error("SecureStore setItem failed:", e);
      }
    }
  },
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error("Local Storage getItem failed:", e);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (e) {
        console.error("SecureStore getItem failed:", e);
        return null;
      }
    }
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Local Storage deleteItem failed:", e);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        console.error("SecureStore deleteItem failed:", e);
      }
    }
  }
};

export const setAuthToken = async (token: string) => {
  inMemoryToken = token;
  await tokenStorage.setItem("auth_token", token);
};

export const getAuthToken = async () => {
  if (inMemoryToken) return inMemoryToken;
  return await tokenStorage.getItem("auth_token");
};

export const clearAuthToken = async () => {
  inMemoryToken = null;
  await tokenStorage.deleteItem("auth_token");
};

export const getInMemoryToken = () => inMemoryToken;
