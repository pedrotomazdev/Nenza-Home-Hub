import "../global.css";
import { Colors } from "../theme/colors";
import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { ServerStatusProvider } from "context/ServerStatusProvider";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'JetBrains Mono Medium': require('../assets/fonts/JetBrainsMono-Medium.ttf'),
        'JetBrains Mono Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
        'JetBrains Mono': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }
    return (
        <ServerStatusProvider>
            <Stack
                screenOptions={{
                    contentStyle: {
                        backgroundColor: Colors.background,
                    },
                    headerShown: false
                }}
            />
        </ServerStatusProvider>
    )
        ;
}