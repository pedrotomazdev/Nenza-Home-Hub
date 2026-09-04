import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { AppText } from "components/ui/AppText";
import { Icon } from "components/ui/Icon";
import { Colors } from "theme/colors";
import { BatteryInfo, DiskInfo, restartServer } from "services/serverStatus";
import { useServerStatus } from "context/ServerStatusProvider";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { CyberpunkSparkline } from "./CyberpunkSparkline";

function formatUptime(seconds: number) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function isBatteryInfo(battery: unknown): battery is BatteryInfo {
    return typeof battery === "object" && battery !== null && "percentage" in battery;
}

function isDiskInfo(disk: unknown): disk is DiskInfo {
    return typeof disk === "object" && disk !== null && "usagePercent" in disk;
}

function ProgressBar({
    value,
    label,
    subtitle,
}: {
    value: number;
    label: string;
    subtitle?: string;
}) {
    const percentage = Math.min(Math.max(value, 0), 100);

    const getStatusColor = () => {
        if (percentage >= 80) return "#ef4444";
        if (percentage >= 60) return "#eab308";
        return "#22c55e";
    };

    const statusColor = getStatusColor();

    return (
        <View className="gap-2">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                    />
                    <AppText className="text-xs font-body-medium text-onSurface">
                        {label}
                        {subtitle ? (
                            <AppText className="text-xs font-body text-onSurfaceVariant opacity-60">
                                {`  ${subtitle}`}
                            </AppText>
                        ) : null}
                    </AppText>
                </View>

                <View
                    className="rounded-md px-2 py-0.5 border"
                    style={{
                        backgroundColor: `${statusColor}15`,
                        borderColor: `${statusColor}33`,
                    }}
                >
                    <AppText
                        className="text-xs font-body-bold"
                        style={{ color: statusColor }}
                    >
                        {Math.round(percentage)}%
                    </AppText>
                </View>
            </View>

            <View
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: Colors.surfaceContainerHighest }}
            >
                <View
                    className="h-full rounded-full"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: statusColor,
                    }}
                />
            </View>
        </View>
    );
}

function MetricCard({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: string;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <View
            className="flex-1 border p-2.5 rounded-xl flex-row items-center gap-2.5 shadow-sm"
            style={{
                borderColor: highlight ? Colors.primary + "44" : Colors.border + "33",
                backgroundColor: Colors.surfaceContainerHigh,
            }}
        >
            <View
                className="w-8 h-8 rounded-lg items-center justify-center border"
                style={{
                    backgroundColor: Colors.surfaceContainer,
                    borderColor: Colors.border + "44",
                }}
            >
                <Icon
                    name={icon}
                    size={16}
                    color={highlight ? Colors.primary : Colors.textSecondary}
                />
            </View>
            <View className="flex-1">
                <AppText className="text-[11px] font-body text-onSurfaceVariant opacity-60" numberOfLines={1}>
                    {label}
                </AppText>
                <AppText className="font-body-bold text-xs text-onSurface" numberOfLines={1}>
                    {value}
                </AppText>
            </View>
        </View>
    );
}

export function ServerStatus() {
    const { server, isOnline, pingHistory, ramHistory, refetch } = useServerStatus();
    const [restarting, setRestarting] = useState(false);

    const handleRestart = async () => {
        try {
            setRestarting(true);
            await restartServer();
            setTimeout(() => {
                refetch();
                setRestarting(false);
            }, 2500);
        } catch {
            setRestarting(false);
        }
    };

    if (!server) {
        return (
            <View
                className="rounded-2xl p-4 gap-3 border shadow-sm"
                style={{
                    backgroundColor: Colors.surfaceContainer,
                    borderColor: Colors.border + "33",
                }}
            >
                <View className="flex-row items-center gap-3">
                    <View
                        className="w-10 h-10 rounded-xl items-center justify-center border"
                        style={{
                            backgroundColor: Colors.surfaceContainerHigh,
                            borderColor: Colors.border + "44",
                        }}
                    >
                        {isOnline ? (
                            <ActivityIndicator color={Colors.primary} size="small" />
                        ) : (
                            <Icon
                                name="ServerOff"
                                size={20}
                                color={Colors.error}
                            />
                        )}
                    </View>

                    <View className="flex-1">
                        <AppText className="font-body-bold text-sm text-onSurface">
                            Servidor Offline
                        </AppText>
                        <AppText className="text-xs font-body text-onSurfaceVariant opacity-60">
                            Não foi possível conectar ao NenzaHub
                        </AppText>

                        <AppText className="text-xs font-body text-onSurfaceVariant opacity-60">
                            ••• Tendando reconexão •••
                        </AppText>
                    </View>
                </View>
            </View>
        );
    }

    const battery = isBatteryInfo(server.android?.battery) ? server.android.battery : null;
    const disk = isDiskInfo(server.android?.disk) ? server.android.disk : null;
    const diskPercent = disk ? parseFloat(disk.usagePercent) : 0;

    const pingDisplay = typeof server.latency?.networkPingMs === "number"
        ? `${server.latency.networkPingMs} ms`
        : server.latency?.networkPingMs ?? "N/A";

    const wifiDisplay = server.wifi?.signalPercent
        ? `${server.wifi.signalPercent}% (${server.wifi.linkSpeedMbps ?? "?"} Mbps)`
        : "N/A";

    return (
        <LinearGradient
            className="rounded-2xl border"
            colors={["#0F1E2E", "#111827"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                overflow: "hidden",
                borderColor: Colors.primary + "33",
            }}
        >
            <View className="p-4 gap-4">
                {/* Header */}
                <View className="flex-row items-center gap-3">
                    <View
                        className="w-10 h-10 rounded-xl items-center justify-center border"
                        style={{
                            backgroundColor: `${Colors.tertiary}15`,
                            borderColor: `${Colors.tertiary}33`,
                        }}
                    >
                        <Icon name="Server" size={20} color={Colors.tertiary} />
                    </View>

                    <View className="flex-1">
                        <AppText className="font-body-bold text-sm text-onSurface">
                            {server.server}
                        </AppText>

                        <View className="flex-row items-center gap-1.5 mt-0.5">
                            <View
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: Colors.tertiary }}
                            />
                            <AppText className="text-xs font-body text-tertiary" style={{ color: Colors.tertiary }}>
                                Operacional
                            </AppText>
                        </View>
                    </View>

                    {/* Botão de Reiniciar Servidor */}
                    <Pressable
                        onPress={handleRestart}
                        disabled={restarting}
                        className="w-8 h-8 rounded-lg items-center justify-center border active:opacity-70"
                        style={{
                            backgroundColor: Colors.surfaceContainerHigh,
                            borderColor: Colors.border + "44",
                        }}
                    >
                        {restarting ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <Icon name="RotateCw" size={14} color={Colors.primary} />
                        )}
                    </Pressable>

                    <View
                        className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
                        style={{
                            backgroundColor: Colors.surfaceContainerHigh,
                            borderColor: Colors.border + "44",
                        }}
                    >
                        <Icon name="Cpu" size={13} color={Colors.primary} />
                        <AppText className="text-xs font-body-bold" style={{ color: Colors.primary }}>
                            {server.cpu.cores} cores
                        </AppText>
                    </View>
                </View>

                {/* Barra de Memória RAM */}
                <ProgressBar
                    label="Memória RAM"
                    subtitle={`${server.memory.usedMB}MB / ${server.memory.totalMB}MB`}
                    value={server.memory.usagePercent}
                />

                {/* Barra de Armazenamento */}
                {disk && (
                    <ProgressBar
                        label="Armazenamento"
                        subtitle={`${disk.used} / ${disk.total}`}
                        value={diskPercent}
                    />
                )}

                {/* Grid 1: Latências e Performance */}
                {server.latency && (
                    <View className="flex-row gap-2.5">
                        <MetricCard
                            icon="Zap"
                            label="Servidor (ms)"
                            value={`${server.latency.serverProcessingMs} ms`}
                        />
                        <MetricCard
                            icon="Activity"
                            label="Ping Rede"
                            value={pingDisplay}
                            highlight
                        />
                    </View>
                )}

                {/* Grid 2: Wi-Fi e Uptime */}
                <View className="flex-row gap-2.5">
                    <MetricCard
                        icon="Wifi"
                        label={`Wi-Fi ${server.wifi?.is5GHz ? "(5G)" : ""}`}
                        value={wifiDisplay}
                        highlight
                    />
                    <MetricCard
                        icon="Clock3"
                        label="Uptime (Node)"
                        value={formatUptime(server.uptime.processSeconds)}
                    />
                </View>

                {/* Grid 3: Hardware (Bateria e Temp) */}
                <View className="flex-row gap-2.5">
                    {battery ? (
                        <>
                            <MetricCard
                                icon="Battery"
                                label="Bateria"
                                value={`${battery.percentage}% (${battery.status})`}
                            />
                            <MetricCard
                                icon="Thermometer"
                                label="Temp. Bateria"
                                value={`${battery.temperature}°C`}
                            />
                        </>
                    ) : (
                        <MetricCard
                            icon="Gauge"
                            label="Carga da CPU"
                            value={server.cpu.loadAvg[0]?.toFixed(2) ?? "0.00"}
                        />
                    )}
                </View>

                {/* Gráfico Neon Cyberpunk (Histórico em Tempo Real) */}
                <CyberpunkSparkline
                    title="Latência em Tempo Real"
                    unit="ms"
                    data={pingHistory.length > 0 ? pingHistory : [25, 26, 25, 24, 28, 25]}
                    color="#00f0ff"
                    glowColor="#00f0ff"
                    height={55}
                />
            </View>
        </LinearGradient>
    );
}