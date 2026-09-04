import { ReactNode } from "react";
import { ScrollView, View } from "react-native";

interface ScreenProps {
    children: ReactNode,
    header?: ReactNode,
    scroll?: boolean,
}

export function Screen({
    children,
    header,
    scroll = true,
}: ScreenProps) {

    return (
        <View className="flex-1 bg-bgmain">
            <View className="relative flex-1">

                {header}

                {scroll ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="px-3 py-6">
                            {children}
                        </View>
                    </ScrollView>
                ) : (
                    <View className="flex-1 p-3">
                        {children}
                    </View>
                )}
            </View>
        </View>
    );
}