import { Platform } from "react-native";
import Constants from "expo-constants";

// Detect if we are running in a browser
const isWeb = Platform.OS === "web";

// Extract IP from Expo development server (e.g., 192.168.31.23:8081 -> 192.168.31.23)
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0] || "192.168.31.23";

/**
 * CENTRALIZED API CONFIGURATION
 * 
 * In Production (Vercel): Uses EXPO_PUBLIC_API_URL or API_BASE_URL env vars.
 * In Local Dev (Expo): Defaults to localhost:5000 (web) or local IP:5000 (mobile).
 */
const baseUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL;

export const API_BASE_URL = baseUrl || (isWeb
  ? "http://localhost:5000"
  : `http://${localIp}:5000`);

// Debugging log for production/development auditing
console.log("[API] Using Base URL:", API_BASE_URL);

if (!baseUrl && !__DEV__) {
  console.warn("[API] WARNING: No production API URL (EXPO_PUBLIC_API_URL) configured. Falling back to localhost.");
}
