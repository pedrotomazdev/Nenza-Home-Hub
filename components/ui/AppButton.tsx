import { Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { Icon, IconName } from "./Icon";
import { Colors } from "theme/colors";

interface ButtonProps {
    text?: string;
    className?: string;
    icon?: IconName;
    iconColor?: string;
    bgColor?: string;
    bgColorPress?: string;
    disabled?: boolean;
    onPress?: () => void;
}

export function AppButton({
    text,
    className = "",
    icon,
    iconColor,
    bgColor,
    bgColorPress,
    disabled = false,
    onPress,
}: ButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            android_ripple={{
                color: bgColorPress ? bgColorPress : Colors.secondary + "40",
                borderless: false,
            }}
            style={({ pressed }) => ({
                backgroundColor: disabled
                    ? Colors.surfaceContainerHighest
                    : bgColor
                    ? bgColor
                    : Colors.primary,
                opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
            })}
            className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl ${className}`}
        >
            {icon && (
                <Icon
                    name={icon}
                    size={18}
                    color={disabled ? Colors.textSecondary : iconColor ? iconColor : Colors.onPrimary}
                />
            )}
            {text && (
                <AppText
                    variant="button"
                    className="text-sm text-center font-body-bold tracking-wide"
                    style={{
                        color: disabled ? Colors.textSecondary : Colors.onPrimary,
                    }}
                >
                    {text}
                </AppText>
            )}
        </Pressable>
    );
}