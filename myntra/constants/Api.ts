import { Platform } from "react-native";
import Constants from "expo-constants";

// Detect if we are running in a browser
const isWeb = Platform.OS === "web";

// Extract IP from Expo development server (e.g., 192.168.31.23:8081 -> 192.168.31.23)
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0] || "192.168.31.23";

// Use environment variable if available, otherwise fallback to local IP/localhost
const baseUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL;

export const API_BASE_URL = baseUrl || (isWeb
  ? "http://localhost:5000"
  : `http://${localIp}:5000`);
