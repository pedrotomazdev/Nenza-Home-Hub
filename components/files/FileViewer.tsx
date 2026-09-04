import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import { AppText } from "components/ui/AppText";
import { Icon } from "components/ui/Icon";
import { Colors } from "theme/colors";
import { API_URL } from "services/api";
import { FileIcon } from "./FileIcon";

interface FileViewerProps {
    visible: boolean;
    folder: string;
    fileName: string;
    fileType: string;
    onClose: () => void;
}

export function FileViewer({
    visible,
    folder,
    fileName,
    fileType,
    onClose,
}: FileViewerProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!visible || !fileName) {
            return;
        }

        async function loadFile() {
            try {
                setLoading(true);
                setError("");
                setContent("");

                const url =
                    `${API_URL}/api/files/` +
                    `${encodeURIComponent(folder)}/` +
                    `${encodeURIComponent(fileName)}`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Não foi possível ler o arquivo.");
                }

                const data = await response.json();
                setContent(data.content ?? "");
            } catch (err) {
                console.error("Erro ao carregar arquivo:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar o arquivo."
                );
            } finally {
                setLoading(false);
            }
        }

        loadFile();
    }, [visible, folder, fileName]);

    const extension = fileName.split(".").pop()?.toUpperCase() ?? "TXT";

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View
                className="flex-1"
                style={{
                    backgroundColor: Colors.background,
                }}
            >
                {/* Header */}
                <View
                    className="h-16 px-4 flex-row items-center justify-between border-b"
                    style={{
                        backgroundColor: Colors.surface,
                        borderColor: Colors.border + "33",
                    }}
                >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                        <View
                            className="w-10 h-10 rounded-xl items-center justify-center border"
                            style={{
                                backgroundColor: Colors.surfaceContainer,
                                borderColor: Colors.border + "44",
                            }}
                        >
                            <FileIcon
                                mimeType={fileType === null ? "folder" : fileType}
                                size={22}
                            />
                        </View>

                        <View className="flex-1">
                            <AppText
                                className="font-body-bold text-sm text-onSurface"
                                numberOfLines={1}
                            >
                                {fileName}
                            </AppText>
                            <View className="flex-row items-center gap-2 mt-0.5">
                                <View
                                    className="px-1.5 py-0.2 rounded border"
                                    style={{
                                        backgroundColor: Colors.surfaceContainerHigh,
                                        borderColor: Colors.border + "33",
                                    }}
                                >
                                    <AppText className="text-[10px] font-body text-onSurfaceVariant">
                                        {extension}
                                    </AppText>
                                </View>
                                <AppText className="text-[11px] font-body text-onSurfaceVariant opacity-50" numberOfLines={1}>
                                    {folder}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        onPress={onClose}
                        className="w-9 h-9 rounded-xl items-center justify-center border active:opacity-70"
                        style={{
                            backgroundColor: Colors.surfaceContainer,
                            borderColor: Colors.border + "44",
                        }}
                    >
                        <Icon
                            name="X"
                            size={18}
                            color={Colors.textSecondary}
                        />
                    </Pressable>
                </View>

                {/* Conteúdo */}
                {loading ? (
                    <View className="flex-1 items-center justify-center gap-3">
                        <ActivityIndicator
                            size="small"
                            color={Colors.primary}
                        />
                        <AppText className="text-xs font-body text-onSurfaceVariant opacity-60">
                            Carregando arquivo...
                        </AppText>
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6 gap-3">
                        <View
                            className="w-12 h-12 rounded-2xl items-center justify-center border"
                            style={{
                                backgroundColor: Colors.errorContainer + "33",
                                borderColor: Colors.error + "44",
                            }}
                        >
                            <Icon
                                name="CircleAlert"
                                size={24}
                                color={Colors.error}
                            />
                        </View>
                        <AppText className="font-body-bold text-sm text-onSurface text-center">
                            Erro ao carregar
                        </AppText>
                        <AppText className="text-xs font-body text-onSurfaceVariant text-center opacity-60">
                            {error}
                        </AppText>
                    </View>
                ) : (
                    <View
                        className="flex-1 m-3 rounded-2xl border overflow-hidden"
                        style={{
                            backgroundColor: Colors.surfaceContainerLowest,
                            borderColor: Colors.border + "33",
                        }}
                    >
                        <ScrollView
                            className="flex-1"
                            contentContainerClassName="p-4"
                            horizontal={false}
                        >
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator
                            >
                                <AppText
                                    className="font-body text-xs leading-6"
                                    style={{
                                        color: Colors.textPrimary,
                                        minWidth: "100%",
                                    }}
                                >
                                    {content}
                                </AppText>
                            </ScrollView>
                        </ScrollView>
                    </View>
                )}
            </View>
        </Modal>
    );
}