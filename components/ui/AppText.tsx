import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Linking, Text, TextProps } from "react-native";
import { Colors } from "theme/colors";

export type TextVariant =
    | "primary"
    | "secondary"
    | "muted"
    | "link"
    | "button"
    | "contrast"
    | (string & {});

interface AppTextProps extends TextProps {
    variant?: TextVariant;
    color?: string;
    /** URL externa (ex: 'https://google.com') ou Rota Interna (ex: '/profile') */
    href?: string;
    className?: string;
}

export function AppText({
    variant = "primary",
    color,
    href,
    className,
    children,
    style,
    onPress,
    ...props
}: AppTextProps) {

    const textColors: Record<string, string> = {
        primary: Colors.textPrimary,
        secondary: Colors.textSecondary,
        muted: Colors.textSecondary,
        link: Colors.primary,
        button: "#FFFFFF",
        contrast: Colors.textPrimary,
    };

    // Se tiver href ou onPress, automaticamente assume estilo de link se não definido
    const isLink = !!href || variant === "link";
    const finalVariant = isLink && variant === "primary" ? "link" : variant;
    const finalColor = color || textColors[finalVariant] || finalVariant;

    const handlePress = async (e: any) => {
        // Vibração tátil sutil de link
        await Haptics.selectionAsync();

        if (href) {
            if (href.startsWith("http://") || href.startsWith("https://")) {
                // Link Externo (Abre no navegador)
                const supported = await Linking.canOpenURL(href);
                if (supported) {
                    await Linking.openURL(href);
                }
            } else {
                // Rota Interna do App (Expo Router)
                router.push(href as any);
            }
        }

        // Caso tenha passado uma função onPress manual
        if (onPress) {
            onPress(e);
        }
    };

    return (
        <Text
            {...props}
            onPress={href || onPress ? handlePress : undefined}
            style={[{ color: finalColor }, style]}
            className={`${isLink ? "underline" : ""} ${className || ""}`}
        >
            {children}
        </Text>
    );
}