import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getServerStatus, ServerStatus as ServerStatusData } from "services/serverStatus";

interface ServerStatusContextData {
    server: ServerStatusData | null;
    isOnline: boolean;
    isLoading: boolean;
    pingHistory: number[];
    ramHistory: number[];
    refetch: () => Promise<void>;
}

const ServerStatusContext = createContext<ServerStatusContextData>({} as ServerStatusContextData);

export function ServerStatusProvider({ children }: { children: ReactNode }) {
    const [server, setServer] = useState<ServerStatusData | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pingHistory, setPingHistory] = useState<number[]>([]);
    const [ramHistory, setRamHistory] = useState<number[]>([]);

    async function loadStatus() {
        try {
            const data = await getServerStatus();
            setServer(data);
            setIsOnline(true);

            // Atualiza histórico de Ping (ms)
            if (typeof data.latency?.networkPingMs === "number") {
                const ping = data.latency.networkPingMs;
                setPingHistory(prev => [...prev.slice(-19), ping]);
            }

            // Atualiza histórico de RAM (%)
            if (typeof data.memory?.usagePercent === "number") {
                const ram = data.memory.usagePercent;
                setRamHistory(prev => [...prev.slice(-19), ram]);
            }
        } catch {
            setIsOnline(false);
            setServer(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ServerStatusContext.Provider value={{ 
            server, 
            isOnline, 
            isLoading, 
            pingHistory, 
            ramHistory, 
            refetch: loadStatus 
        }}>
            {children}
        </ServerStatusContext.Provider>
    );
}

export function useServerStatus() {
    const context = useContext(ServerStatusContext);
    if (!context) {
        throw new Error("useServerStatus deve ser usado dentro de um ServerStatusProvider");
    }
    return context;
}