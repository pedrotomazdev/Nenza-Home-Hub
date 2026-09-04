import { View } from "react-native";
import { AppText } from "./AppText";
import { HyperLink } from "./HyperLink";
import { Icon, IconName } from "./Icon";
import { Colors } from "theme/colors";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: IconName;
    actionText?: string;
    onActionPress?: () => void;
}

export function SectionHeader({
    title,
    subtitle,
    icon,
    actionText,
    onActionPress,
}: SectionHeaderProps) {
    return (
        <View className="flex-row items-center justify-between px-1 py-1.5">
            {/* Lado Esquerdo: Ícone + Títulos */}
            <View className="flex-1 flex-row items-center gap-2.5 mr-2">
                {icon && (
                    <View
                        className="h-9 w-9 items-center justify-center rounded-xl border"
                        style={{
                            backgroundColor: Colors.surfaceContainer,
                            borderColor: Colors.primary + "33",
                        }}
                    >
                        <Icon name={icon} color={Colors.primary} size={18} />
                    </View>
                )}

                <View className="flex-1 justify-center">
                    <AppText variant="primary" className="font-body-bold text-base leading-tight">
                        {title}
                    </AppText>
                    {subtitle && (
                        <AppText
                            variant="secondary"
                            className="font-body text-xs opacity-60 mt-0.5"
                        >
                            {subtitle}
                        </AppText>
                    )}
                </View>
            </View>

            {/* Lado Direito: Ação */}
            {actionText && onActionPress && (
                <View className="shrink-0">
                    <HyperLink text={actionText} onPress={onActionPress} />
                </View>
            )}
        </View>
    );
}