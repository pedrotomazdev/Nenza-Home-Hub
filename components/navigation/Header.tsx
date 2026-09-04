import { Pressable, View } from "react-native";
import { AppText } from "components/ui/AppText";
import { Icon } from "components/ui/Icon";
import { useServerStatus } from "context/ServerStatusProvider";
import { Colors } from "theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GamerLedStrip } from "components/ui/GamerNeonBar";

interface HeaderProps {
    title: string;
    icon: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function Header({
    title,
    icon,
    subtitle,
    showBackButton,
    onBackPress,
}: HeaderProps) {
    const insets = useSafeAreaInsets();
    const { server, isOnline, isLoading } = useServerStatus();

    const pingDisplay = typeof server?.latency?.networkPingMs === "number"
        ? `${server.latency.networkPingMs}ms`
        : "N/A";

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/" as any);
        }
    };

    return (

        <View className="bg-surface">
            <View
                style={{
                    height: insets.top,
                    backgroundColor: Colors.primary,
                }}
            />
            <View className="w-full max-w-5xl self-center  relative">

                <View className="flex-row items-center justify-between  py-3">
                    {/* Lado Esquerdo: Ícone + Título + Subtitle */}
                    <View className="flex-row items-center gap-3">
                        {showBackButton ? (
                            <Pressable
                                onPress={handleBack}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                className="w-9 h-9 rounded-xl items-center justify-center border active:opacity-75"
                                style={{
                                    backgroundColor: Colors.surfaceContainer,
                                    borderColor: Colors.border + "66",
                                }}
                            >
                                <Icon name="ChevronLeft" color={Colors.primary} size={20} />
                            </Pressable>
                        ) : (
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center border shadow-sm"
                                style={{
                                    backgroundColor: Colors.surfaceContainer,
                                    borderColor: Colors.primary + "33",
                                }}
                            >
                                <Icon name={icon} size={20} color={Colors.primary} />
                            </View>
                        )}

                        <View>
                            <View className="flex-row items-center gap-2">
                                <AppText className="font-body-bold text-base tracking-tight text-onSurface">
                                    {title}
                                </AppText>
                                {subtitle && (
                                    <View
                                        className="px-2 py-0.5 rounded-full border"
                                        style={{
                                            backgroundColor: Colors.surfaceContainerHigh,
                                            borderColor: Colors.border + "44",
                                        }}
                                    >
                                        <AppText className="text-[10px] text-onSurfaceVariant font-body">
                                            &gt; {subtitle}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Status ONLINE/OFFLINE e Ping */}
                    <View
                        className="flex-row items-center gap-2.5 px-3 py-1.5 rounded-xl border"
                        style={{
                            backgroundColor: Colors.surfaceContainer,
                            borderColor: isOnline ? Colors.tertiary + "33" : Colors.error + "33",
                        }}
                    >
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: isOnline ? Colors.tertiary : Colors.error,
                                shadowColor: isOnline ? Colors.tertiary : Colors.error,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        />

                        <View className="items-end">
                            <AppText
                                className="text-[11px] font-body-bold uppercase tracking-wider leading-tight"
                                style={{ color: isOnline ? Colors.tertiary : Colors.error }}
                            >
                                {isLoading ? "CARREGANDO" : isOnline ? "ONLINE" : "OFFLINE"}
                            </AppText>

                            {isOnline && (
                                <AppText className="text-[10px] font-body text-onSurfaceVariant opacity-70 leading-tight">
                                    {pingDisplay}
                                </AppText>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <GamerLedStrip
                isOnline={isOnline}
                mode="rainbow"
                height={1.5}
            />
        </View>
    );
}