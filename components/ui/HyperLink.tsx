import { Pressable, View } from "react-native";
import { AppText } from "./AppText";
import { Colors } from "theme/colors";
import { Color } from "expo-router";

interface HyperLinkProps {
    text: string;
    onPress?: () => void;
}

export function HyperLink({ text, onPress }: HyperLinkProps) {
    return (
        <View
            className=" rounded-full overflow-hidden border"
            style={{
                borderColor: Colors.primary + "66",
            }}
        >
            <Pressable
                onPress={onPress}
                style={{
                    backgroundColor: Colors.primary + "22",
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                android_ripple={{ color: Colors.secondary }}

                className="flex-row items-center gap-1.5 px-3 py-1  transition-all"
            >
                <AppText
                    className="text-xs font-body-medium tracking-wide"
                    style={{ color: Colors.primary }}
                >
                    {text}
                </AppText>
            </Pressable>
        </View>
    );
}