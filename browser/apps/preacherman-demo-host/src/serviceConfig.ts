import { isTauri } from "@tauri-apps/api/core";

const PORT_STORAGE_KEY = "preacherman.service-port";
const configuredDefaultPort = Number(import.meta.env.VITE_PREACHERMAN_SERVICE_PORT);
const DEFAULT_PORT = Number.isInteger(configuredDefaultPort) && configuredDefaultPort >= 1024 && configuredDefaultPort <= 65535
  ? configuredDefaultPort
  : 8787;

export function readServicePort(): number {
  const parsed = Number(window.localStorage.getItem(PORT_STORAGE_KEY));
  return Number.isInteger(parsed) && parsed >= 1024 && parsed <= 65535 ? parsed : DEFAULT_PORT;
}

export function saveServicePort(port: number): void {
  window.localStorage.setItem(PORT_STORAGE_KEY, String(port));
}

export function localServiceUrl(path: string): string {
  return localServiceUrlForPort(readServicePort(), path);
}

export function localServiceUrlForPort(port: number, path: string): string {
  if (isTauri()) return `http://127.0.0.1:${port}${path}`;
  const origin = import.meta.env.VITE_PREACHERMAN_SERVICE_URL || window.location.origin;
  return new URL(path, origin).href;
}

export function localServiceWebSocketUrl(path: string): string {
  const url = new URL(localServiceUrl(path));
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
}
