// Clave persistente para recordar la URL del backend en el dispositivo.
const API_BASE_URL_KEY = "baem_api_base_url";

// Normaliza la URL eliminando espacios y barra final.
export function normalizeApiBaseUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

// Detecta si la app corre como nativa dentro de Capacitor.
export function isNativePlatform() {
  return !!window?.Capacitor?.isNativePlatform?.();
}

// URL por defecto en nativo (emulador Android o runtime iOS).
export function getDefaultNativeApiBaseUrl() {
  const isAndroid = window?.Capacitor?.getPlatform?.() === "android";
  return isAndroid ? "http://10.0.2.2:8080" : "http://localhost:8080";
}

// Recupera la URL guardada manualmente por el usuario (si existe).
export function getSavedApiBaseUrl() {
  return normalizeApiBaseUrl(localStorage.getItem(API_BASE_URL_KEY));
}

// Persiste una URL de backend para reutilizarla en siguientes arranques.
export function saveApiBaseUrl(url) {
  const normalized = normalizeApiBaseUrl(url);
  if (!normalized) return "";
  localStorage.setItem(API_BASE_URL_KEY, normalized);
  return normalized;
}

// Calcula la URL base final con prioridad: ENV > guardada > fallback nativo.
export function getConfiguredApiBaseUrl() {
  const envUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (envUrl) return envUrl;

  const savedUrl = getSavedApiBaseUrl();
  if (savedUrl) return savedUrl;

  if (isNativePlatform()) return getDefaultNativeApiBaseUrl();
  return "";
}
