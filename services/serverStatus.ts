import { API_URL } from "./api";

export interface BatteryInfo {
    percentage: number;
    plugged: string;
    status: string;
    temperature: number;
}

export interface DiskInfo {
    total: string;
    used: string;
    available: string;
    usagePercent: string;
}

export interface LatencyInfo {
    serverProcessingMs: number;
    networkPingMs: number | string; // 'string' para os casos em que retorna "Offline" ou "Sem conexão"
}

export interface WifiInfo {
    ssid: string;
    bssid?: string;
    ip?: string;
    rssi?: number;
    signalPercent: number;
    linkSpeedMbps?: number | null;
    frequencyMhz?: number | null;
    is5GHz?: boolean;
}

export interface NetworkTrafficInfo {
    receivedMB: number;
    transmittedMB: number;
}

export interface ServerStatus {
    status: string;
    server: string;

    latency: LatencyInfo;

    uptime: {
        processSeconds: number;
        systemSeconds: number;
    };

    memory: {
        totalMB: number;
        freeMB: number;
        usedMB: number;
        usagePercent: number;
    };

    cpu: {
        cores: number | string;
        model: string;
        loadAvg: number[];
        temperature?: string;
    };

    wifi?: WifiInfo;

    networkTraffic?: NetworkTrafficInfo;

    system: {
        platform: string;
        arch: string;
        hostname: string;
        nodeVersion: string;
    };

    android: {
        battery: BatteryInfo | string;
        disk: DiskInfo | string;
    };

    timestamp: string;
}

export async function getServerStatus(): Promise<ServerStatus> {
    const response = await fetch(`${API_URL}/api/health`);

    if (!response.ok) {
        throw new Error("Servidor indisponível.");
    }

    return response.json();
}

export async function restartServer(): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/server/restart`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Não foi possível reiniciar o servidor.");
    }

    return response.json();
}

export async function pingServer(): Promise<{ pingMs: number | string }> {
    const response = await fetch(`${API_URL}/api/server/ping`);

    if (!response.ok) {
        throw new Error("Não foi possível testar o ping.");
    }

    return response.json();
}