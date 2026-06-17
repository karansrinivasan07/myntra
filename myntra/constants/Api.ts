import { Platform } from "react-native";
import Constants from "expo-constants";

// Detect if we are running in a browser
const isWeb = Platform.OS === "web";

// Extract IP from Expo development server (e.g., 192.168.31.23:8081 -> 192.168.31.23)
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0] || "192.168.31.23";

// Use local machine IP for emulators/devices, localhost for web
export const API_BASE_URL = isWeb 
  ? "http://localhost:5000" 
  : `http://${localIp}:5000`;
