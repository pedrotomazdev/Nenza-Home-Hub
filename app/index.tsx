import { Header } from "components/navigation/Header";
import { Screen } from "components/Screen";
import { AppInput } from "components/ui/AppInput";
import {
    DropdownContent,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "components/ui/Dropdown";
import { AppText } from "components/ui/AppText";
import { Icon } from "components/ui/Icon";
import { Colors } from "theme/colors";
import { ActivityIndicator, FlatList, Image, Linking, Modal, Pressable, Text, View } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";

import {
    getFiles,
    uploadFile,
    getFolders,
    getFolderFiles,
    deleteFolder,
    createFolder,
    deleteFile,
    downloadFolder,
    downloadFile,
} from "../services/fileService";
import { FILE_ICONS, MIME_ICONS, NenzaFile, NenzaFolder, SYSTEM_FOLDERS } from "types/files";
import { formatDateTime } from "utils/formatDate";
import { AppButton } from "components/ui/AppButton";
import { SectionHeader } from "components/ui/SectionHeader";
import { API_URL } from "services/api";
import { FileIcon } from "components/files/FileIcon";
import { ServerStatus } from "components/server/ServerStatus";
import { FileViewer } from "components/files/FileViewer";
import { GamerLedStrip } from "components/ui/GamerNeonBar";
import { useServerStatus } from "context/ServerStatusProvider";


export default function HomeScreen() {

    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerFile, setViewerFile] = useState<{
        name: string;
        type: string;
        folder: string;
    } | null>(null);

    const [files, setFiles] = useState<NenzaFile[]>([]);
    const [folders, setFolders] = useState<NenzaFolder[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [activeFolder, setActiveFolder] = useState<string>("Backups");
    const [newFolder, setNewFolder] = useState("");
    const [modalNewFolder, setModalNewFolder] = useState(false);
    const [search, setSearch] = useState("");


    const loadFiles = async () => {
        try {
            setLoadingFiles(true);
            const result = await getFiles();
            setFiles(result);
        } catch (error) {
            console.error("Erro ao carregar arquivos:", error);
        } finally {
            setLoadingFiles(false);
        }
    };

    const loadFolders = async () => {
        try {
            setLoadingFolders(true);
            const resp = await getFolders();
            setFolders(resp);
        } catch (error) {
            console.error("Erro ao listar pastas: ", error);
        } finally {
            setLoadingFolders(false);
        }
    };

    const loadFolderFiles = async (folder: string) => {
        try {
            setLoadingFiles(true);
            const resp = await getFolderFiles(folder);
            setFiles(resp);
        } catch (error) {
            console.error(`Erro ao carregar pasta ${folder}: `, error);
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (activeFolder) {
            loadFolderFiles(activeFolder);
        }
    }, [activeFolder]);

    const handleDeleteFolder = async (folder: string) => {
        try {
            await deleteFolder(folder);

            // await loadFolders();

            if (activeFolder === folder) {
                setActiveFolder("Backups");
                await loadFiles();
            }
        } catch (error) {
            console.error(`Erro ao excluir pasta ${folder}:`, error);
        }
    };

    const handleDeleteFile = async (file: string) => {
        const path = activeFolder + "/" + file;
        try {
            await deleteFile(path);

            await loadFolders();
            await loadFolderFiles(activeFolder);

        } catch (error) {
            console.error(`Erro ao deletar arquivo ${file}: `, error)
        }
    }

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: "*/*",
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];

            setUploading(true);
            setUploadProgress(0);

            await uploadFile(
                file.uri,
                file.name,
                file.mimeType ?? "application/octet-stream",
                activeFolder,
                setUploadProgress
            );

            await loadFolderFiles(activeFolder);

        } catch (error) {
            console.error("Erro no upload:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (item: NenzaFile) => {
        try {
            if (item.mimeType === null) {
                // Se for pasta, inclui a pasta ativa no caminho (ex: Projetos/NenzaDex-V2-main)
                const fullFolderPath = activeFolder ? `${activeFolder}/${item.name}` : item.name;
                downloadFolder(fullFolderPath);
            } else {
                // Se for arquivo, baixa o arquivo direto da pasta ativa
                downloadFile(activeFolder, item.name);
            }
        } catch (error) {
            console.error("Não foi possível fazer o download: ", error);
        }
    };

    const handleLoadFolder = (folder: string) => {
        setFiles([]);
        setActiveFolder(folder);
    };

    const handleOpenNewFolder = () => {
        setModalNewFolder(true);
        setNewFolder("");
    }

    const handleCloseNewFolder = () => {
        setModalNewFolder(false);
        setNewFolder("");
    }

    const handleCreateFolder = async (name: string) => {
        try {
            if (!name.trim()) return;

            setLoadingFolders(true)
            handleCloseNewFolder();

            await createFolder(name.trim());
            await loadFolders();

        } catch (error) {
            console.error("Erro ao criar pasta: ", error)
        } finally {
            setLoadingFolders(false)
        }
    }

    function getFileIcon(mimeType?: string) {
        const type = MIME_ICONS[mimeType ?? ""] ?? "unknown";
        return FILE_ICONS[type];
    }

    async function handleOpenFile(file: NenzaFile) {
        const fileUrl =
            `${API_URL}/storage/` +
            `${encodeURIComponent(activeFolder)}/` +
            `${encodeURIComponent(file.name)}`;

        if (file.mimeType === null) {
            const folderPath = `${activeFolder}/${file.name}`;

            handleLoadFolder(folderPath);
            return;
        }

        // Código / texto
        if (isTextFile(file.name)) {
            setViewerFile({
                name: file.name,
                type: file.mimeType,
                folder: activeFolder,
            });

            setViewerVisible(true);
            return;
        }





        // Imagens, vídeos, áudios e demais arquivos
        try {
            await Linking.openURL(fileUrl);
        } catch (error) {
            console.error("Erro ao abrir arquivo:", error);
        }
    }

    async function handleOpenInBrowser(file: NenzaFile) {
        const fileUrl =
            `${API_URL}/storage/` +
            `${encodeURIComponent(activeFolder)}/` +
            `${encodeURIComponent(file.name)}`;


        console.log(activeFolder)
        console.log(file.name)

        try {
            await Linking.openURL(fileUrl);
        } catch (error) {
            console.error("Erro ao abrir arquivo no navegador:", error);
        }
    }

    function isTextFile(fileName: string) {
        const extension = fileName
            .split(".")
            .pop()
            ?.toLowerCase();

        const textExtensions = [
            "txt",
            "md",
            "mdx",

            "js",
            "jsx",
            "mjs",
            "cjs",

            "ts",
            "tsx",

            "html",
            "htm",

            "css",
            "scss",
            "sass",
            "less",

            "php",
            "py",
            "rb",
            "go",
            "rs",
            "java",
            "kt",
            "kts",
            "swift",
            "c",
            "cpp",
            "h",
            "hpp",
            "cs",

            "json",
            "xml",
            "yaml",
            "yml",
            "toml",
            "ini",
            "env",

            "sh",
            "bash",
            "zsh",

            "sql",

            "gitignore",
            "gitattributes",
        ];

        return extension ? textExtensions.includes(extension) : false;
    }

    function formatFileSize(bytes: number) {
        if (bytes === 0) return "0 B";

        const units = ["B", "KB", "MB", "GB", "TB"];
        const index = Math.floor(Math.log(bytes) / Math.log(1024));

        return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
    }


    // Filtra a busca
    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(search.toLowerCase())
    );


    const handleGoBack = () => {
        if (!activeFolder.includes("/")) {
            return;
        }

        const parentFolder = activeFolder.substring(
            0,
            activeFolder.lastIndexOf("/")
        );

        handleLoadFolder(parentFolder);
    };

    const breadcrumbs = activeFolder.split("/");



    return (
        <>
            <Screen
                header={
                    <Header
                        title="NenzaServerHub"
                        icon="SquareTerminal"
                        subtitle="Início"
                    />
                }
            >
                <View className="w-full max-w-5xl self-center gap-6 py-2 pb-28 relative">

                    {/* Folders Section */}
                    <View className="gap-3">
                        <SectionHeader
                            title="Pastas"
                            icon="Folders"
                            actionText="+ Nova pasta"
                            onActionPress={handleOpenNewFolder}
                            subtitle={`${folders.length} pasta(s)`}
                        />

                        {loadingFolders ? (
                            <View className="py-8 items-center justify-center">
                                <ActivityIndicator
                                    size="large"
                                    color={Colors.primary}
                                />
                            </View>
                        ) : (
                            <FlatList

                                data={folders}
                                keyExtractor={(item) => item.name}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerClassName="gap-3 px-1 py-1"
                                renderItem={({ item: folder }) => {
                                    const isActive = folder.name === activeFolder;
                                    const folderConfig = SYSTEM_FOLDERS[folder.name];

                                    const folderIcon = folderConfig
                                        ? isActive
                                            ? folderConfig.active
                                            : folderConfig.default
                                        : isActive
                                            ? "FolderOpen"
                                            : "Folder";

                                    return (
                                        <Pressable
                                            key={folder.name}
                                            className="w-44 h-32 rounded-2xl relative border p-4 justify-between overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
                                            style={{
                                                backgroundColor: isActive
                                                    ? Colors.surfaceContainerHigh
                                                    : Colors.surfaceContainer,
                                                borderColor: isActive
                                                    ? Colors.primary
                                                    : Colors.border + "33",
                                                shadowColor: isActive ? Colors.primary : "transparent",
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: isActive ? 0.25 : 0,
                                                shadowRadius: 8,
                                                elevation: isActive ? 4 : 1,
                                            }}
                                            onPress={() => handleLoadFolder(folder.name)}
                                        >
                                            {isActive && (
                                                <View
                                                    className="w-1.5 h-1.5 rounded-full absolute top-2 left-2"
                                                    style={{ backgroundColor: Colors.primary }}
                                                />
                                            )}
                                            <View className="flex-row items-center justify-between">
                                                <View
                                                    className="w-10 h-10 rounded-xl items-center justify-center border"
                                                    style={{
                                                        backgroundColor: isActive
                                                            ? Colors.primary + "22"
                                                            : Colors.surfaceContainerHigh,
                                                        borderColor: isActive
                                                            ? Colors.primary + "66"
                                                            : Colors.border + "33",
                                                    }}
                                                >
                                                    <Icon
                                                        name={folderIcon}
                                                        size={20}
                                                        color={isActive ? Colors.primary : Colors.textSecondary}
                                                    />
                                                </View>
                                                {folderConfig?.deletable !== false && (
                                                    <DropdownMenu>
                                                        <DropdownTrigger />
                                                        <DropdownContent width={190}>
                                                            {/* <DropdownItem
                                                            icon="ListCollapse"
                                                            onPress={() => { }}
                                                        >
                                                            Ver detalhes
                                                        </DropdownItem>

                                                        <DropdownItem
                                                            icon="Pencil"
                                                            onPress={() => { }}
                                                        >
                                                            Editar pasta
                                                        </DropdownItem> */}
                                                            <DropdownItem
                                                                icon="Trash2"
                                                                destructive
                                                                onPress={() => { handleDeleteFolder(folder.name); }}
                                                            >
                                                                Excluir pasta
                                                            </DropdownItem>
                                                        </DropdownContent>
                                                    </DropdownMenu>
                                                )}

                                            </View>

                                            <View className="gap-1">
                                                <View className="flex-row items-center justify-between">
                                                    <AppText
                                                        className="font-body-bold text-sm leading-tight flex-1 pr-1"
                                                        style={{ color: isActive ? Colors.primary : Colors.textPrimary }}
                                                        numberOfLines={1}
                                                    >
                                                        {folder.name}
                                                    </AppText>

                                                </View>

                                                <AppText
                                                    className="text-xs font-body opacity-50"
                                                >
                                                    {folder.itemCount} {folder.itemCount === 1 ? "item" : "itens"}
                                                </AppText>
                                            </View>
                                        </Pressable>
                                    );
                                }}
                                ListEmptyComponent={
                                    !loadingFolders ? (
                                        <View className="items-center py-6 gap-2 w-full">
                                            <Icon
                                                name="FolderOpen"
                                                size={28}
                                                color={Colors.primary}
                                            />
                                            <AppText className="text-xs font-body opacity-50">
                                                Nenhuma pasta cadastrada.
                                            </AppText>
                                        </View>
                                    ) : null
                                }
                            />
                        )}
                    </View>

                    {/* Files Section */}
                    <View className="gap-3 min-h-[200px] w-full">
                        {/* Server Header & Breadcrumb Bar */}
                        <View className="flex-row items-center justify-between px-1">
                            <View className="flex-row items-center gap-2">
                                <View
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: Colors.primary }}
                                />
                                <AppText
                                    variant="primary"
                                    className="uppercase font-body-bold text-xs tracking-wider opacity-70"
                                >
                                    NENZASERVER
                                </AppText>
                            </View>

                            <View
                                className="px-2.5 py-0.5 rounded-full border"
                                style={{
                                    backgroundColor: Colors.surfaceContainer,
                                    borderColor: Colors.border + "33",
                                }}
                            >
                                <AppText className="text-xs font-body text-onSurfaceVariant opacity-70">
                                    {files.length} arquivo(s)
                                </AppText>
                            </View>
                        </View>

                        {/* Breadcrumbs */}
                        {/* <View
                            className="flex-row items-center gap-2 px-3 py-2 rounded-xl border"
                            style={{
                                backgroundColor: Colors.surfaceContainer,
                                borderColor: Colors.border + "33",
                            }}
                        >
                            {breadcrumbs.length > 1 && (
                                <Pressable
                                    className="rounded-lg w-7 h-7 items-center justify-center border active:opacity-60"
                                    style={{
                                        backgroundColor: Colors.surfaceContainerHigh,
                                        borderColor: Colors.border + "44",
                                    }}
                                    onPress={handleGoBack}
                                >
                                    <Icon name="ChevronLeft" size={16} color={Colors.primary} />
                                </Pressable>
                            )}

                            <Icon name="Folder" size={14} color={Colors.primary} />

                            <AppText
                                className="text-xs font-body-bold flex-1"
                                style={{ color: Colors.primary }}
                                numberOfLines={1}
                            >
                                {activeFolder}
                            </AppText>
                        </View> */}

                        {/* Files Container */}
                        <View
                            className="p-3 border gap-3 rounded-2xl shadow-sm"
                            style={{
                                backgroundColor: Colors.surfaceContainerLow,
                                borderColor: Colors.border + "33",
                            }}
                        >
                            {/* Breadcrumbs */}
                            <View
                                className="flex-row items-center gap-2 px-3 py-2 rounded-xl border"
                                style={{
                                    backgroundColor: Colors.surfaceContainer,
                                    borderColor: Colors.border + "33",
                                }}
                            >
                                {breadcrumbs.length > 1 && (
                                    <Pressable
                                        className="rounded-lg w-7 h-7 items-center justify-center border active:opacity-60"
                                        style={{
                                            backgroundColor: Colors.surfaceContainerHigh,
                                            borderColor: Colors.border + "44",
                                        }}
                                        onPress={handleGoBack}
                                    >
                                        <Icon name="ChevronLeft" size={16} color={Colors.primary} />
                                    </Pressable>
                                )}

                                <Icon name="Folder" size={14} color={Colors.primary} />

                                <AppText
                                    className="text-xs font-body-bold flex-1"
                                    style={{ color: Colors.primary }}
                                    numberOfLines={1}
                                >
                                    {activeFolder}
                                </AppText>
                            </View>

                            {/* Search Bar */}
                            <View className="relative">
                                <AppInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Buscar arquivos nesta pasta..."
                                    icon="Search"

                                />
                                {search.length > 0 && (
                                    <Pressable
                                        onPress={() => setSearch("")}
                                        className="absolute right-3.5 p-1 top-1/2 -translate-y-1/2 rounded-full active:opacity-60"
                                    >
                                        <Icon name="X" size={16} color={Colors.error} />
                                    </Pressable>
                                )}
                            </View>

                            {loadingFiles ? (
                                <View className="py-12 items-center justify-center gap-2">
                                    <ActivityIndicator
                                        size="large"
                                        color={Colors.primary}
                                    />
                                    <AppText className="text-xs font-body opacity-50">
                                        Carregando arquivos...
                                    </AppText>
                                </View>
                            ) : (
                                <FlatList
                                    keyExtractor={(item) => item.name}
                                    data={filteredFiles}
                                    scrollEnabled={false}
                                    contentContainerClassName="gap-2"
                                    renderItem={({ item: file }) => {
                                        const isImage = getFileIcon(file.mimeType) === "FileImage";
                                        const imageUrl =
                                            `${API_URL}/storage/${activeFolder}/${encodeURIComponent(file.name)}`;
                                        return (
                                            <Pressable
                                                key={file.name}
                                                className="min-h-[64px] rounded-xl border p-3 flex-row items-center justify-between active:scale-[0.99] transition-transform"
                                                style={{
                                                    backgroundColor: Colors.surfaceContainer,
                                                    borderColor: Colors.border + "33",
                                                }}
                                                onPress={() => handleOpenFile(file)}
                                            >
                                                <View className="flex-row items-center gap-3 flex-1 pr-2">
                                                    <View
                                                        className="w-11 h-11 rounded-xl overflow-hidden items-center justify-center border"
                                                        style={{
                                                            backgroundColor: Colors.surfaceContainerHigh,
                                                            borderColor: Colors.border + "33",
                                                        }}
                                                    >
                                                        {isImage ? (
                                                            <FileImagePreview uri={imageUrl} />
                                                        ) : (
                                                            <FileIcon
                                                                mimeType={file.mimeType === null ? "folder" : file.mimeType}
                                                                size={24}
                                                            />
                                                        )}
                                                    </View>

                                                    <View className="gap-0.5 flex-1">
                                                        <AppText
                                                            className="font-body-medium text-sm text-onSurface"
                                                            numberOfLines={1}
                                                        >
                                                            {file.name}
                                                        </AppText>

                                                        <View className="flex-row items-center gap-1.5">
                                                            <AppText className="text-xs font-body opacity-50">
                                                                {formatFileSize(file.size)}
                                                            </AppText>

                                                            <AppText className="text-xs opacity-30">
                                                                •
                                                            </AppText>

                                                            <AppText
                                                                className="text-xs font-body opacity-50 flex-1"
                                                                numberOfLines={1}
                                                            >
                                                                {formatDateTime(file.modifiedAt)}
                                                            </AppText>
                                                        </View>
                                                    </View>
                                                </View>

                                                <DropdownMenu>
                                                    <DropdownTrigger />
                                                    <DropdownContent width={190}>
                                                        <DropdownItem
                                                            icon="Download"
                                                            onPress={() => { handleDownload(file) }}
                                                        >
                                                            Baixar {file.mimeType === null ? "pasta" : "arquivo"}
                                                        </DropdownItem>

                                                        <DropdownItem
                                                            icon="Globe"
                                                            onPress={() => handleOpenInBrowser(file)}
                                                        >
                                                            Ver no navegador
                                                        </DropdownItem>

                                                        <DropdownItem
                                                            icon="Trash2"
                                                            destructive
                                                            onPress={() => { handleDeleteFile(file.name); }}
                                                        >
                                                            Excluir {file.mimeType === null ? "pasta" : "arquivo"}
                                                        </DropdownItem>
                                                    </DropdownContent>
                                                </DropdownMenu>
                                            </Pressable>
                                        );
                                    }}
                                    ListEmptyComponent={
                                        !loadingFiles ? (
                                            <Pressable
                                                className="items-center py-12 px-4 gap-2.5 border border-dashed rounded-2xl"
                                                style={{ borderColor: Colors.border + "44" }}
                                                disabled={uploading}
                                                onPress={handleUpload}
                                            >
                                                {uploading ? (
                                                    <ActivityIndicator size="small" color={Colors.secondary} />
                                                ) : (
                                                    <>

                                                        <View
                                                            className="w-12 h-12 rounded-2xl items-center justify-center border"
                                                            style={{
                                                                backgroundColor: Colors.surfaceContainer,
                                                                borderColor: Colors.border + "33",
                                                            }}
                                                        >
                                                            <Icon
                                                                name="FolderOpen"
                                                                size={24}
                                                                color={Colors.primary}
                                                            />
                                                        </View>

                                                        <AppText className="font-body-bold text-sm text-onSurface">
                                                            {search
                                                                ? "Nenhum resultado encontrado"
                                                                : activeFolder
                                                                    ? "Esta pasta está vazia"
                                                                    : "Nenhum arquivo encontrado"}
                                                        </AppText>

                                                        <AppText className="text-xs font-body opacity-50 text-center max-w-[280px]">
                                                            {search
                                                                ? `Não encontramos nada para "${search}".`
                                                                : activeFolder
                                                                    ? `A pasta ${activeFolder} ainda não possui arquivos, faça upload de um arquivo para começar.`
                                                                    : "Faça upload de um arquivo para começar."}
                                                        </AppText>




                                                    </>
                                                )}
                                            </Pressable>
                                        ) : null
                                    }
                                />
                            )}

                            <View
                                className="items-end"
                            >

                                <Pressable
                                    className="rounded-2xl border flex-row items-center gap-2.5 px-4 py-3.5 shadow-2xl active:scale-[0.96] transition-transform"
                                    style={{
                                        backgroundColor: uploading ? Colors.surfaceContainerHigh : Colors.background,
                                        borderColor: uploading ? Colors.primary : Colors.primaryContainer,
                                        opacity: uploading ? 0.9 : 1,
                                    }}
                                    disabled={uploading}
                                    onPress={handleUpload}
                                >
                                    {uploading ? (
                                        <ActivityIndicator size="small" color={Colors.secondary} />
                                    ) : (
                                        <Icon
                                            name="CloudUpload"
                                            size={20}
                                            color={Colors.primary}
                                        />
                                    )}

                                    <View className="items-start">
                                        <AppText
                                            className="text-xs font-body-bold tracking-wide"
                                            style={{ color: uploading ? Colors.secondary : Colors.primary }}
                                        >
                                            {uploading ? `Enviando ${Math.round(uploadProgress)}%` : "Enviar Arquivo"}
                                        </AppText>
                                        {uploading && (
                                            <View className="h-1 w-24 rounded-full bg-gray-700/50 overflow-hidden mt-1">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${uploadProgress}%`,
                                                        backgroundColor: Colors.primary,
                                                    }}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            </View>

                        </View>
                    </View>

                    {/* Server Status Dashboard */}
                    <ServerStatus />

                </View>
            </Screen>



            {/* Modal Criar Pasta */}
            <Modal
                transparent
                animationType="fade"
                visible={modalNewFolder}
                onRequestClose={handleCloseNewFolder}
            >
                <Pressable
                    className="flex-1 items-center justify-center px-6 bg-black/60"
                    onPress={handleCloseNewFolder}
                >
                    <Pressable
                        className="rounded-2xl p-6 gap-5 border shadow-2xl"
                        style={{
                            backgroundColor: Colors.surfaceContainerHigh,
                            borderColor: Colors.border + "66",
                            width: 440,
                            maxWidth: "94%",
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="gap-1.5">
                            <View className="flex-row items-center gap-3">
                                <View
                                    className="h-10 w-10 items-center justify-center rounded-xl border"
                                    style={{
                                        backgroundColor: `${Colors.tertiary}15`,
                                        borderColor: `${Colors.tertiary}33`,
                                    }}
                                >
                                    <Icon
                                        name="FolderPlus"
                                        size={20}
                                        color={Colors.tertiary}
                                    />
                                </View>

                                <View className="flex-1">
                                    <AppText
                                        variant="primary"
                                        className="font-body-bold text-lg leading-tight"
                                    >
                                        Criar Nova Pasta
                                    </AppText>
                                    <AppText className="text-xs font-body text-onSurfaceVariant opacity-60">
                                        Organize seus arquivos no servidor
                                    </AppText>
                                </View>
                            </View>
                        </View>

                        <View className="gap-2">
                            <AppInput
                                label="Nome da pasta:"
                                value={newFolder}
                                onChangeText={setNewFolder}
                                placeholder="Ex: Backups 2026"
                                keyboardType="default"
                                autoFocus
                            />
                        </View>

                        <View className="flex-row gap-3 pt-1">
                            <View className="flex-1">
                                <AppButton
                                    text="Cancelar"
                                    bgColor={Colors.surfaceContainer}
                                    bgColorPress={Colors.surfaceContainerHighest}
                                    className="border border-white/10"
                                    onPress={handleCloseNewFolder}
                                />
                            </View>

                            <View className="flex-1">
                                <AppButton
                                    text="Criar Pasta"
                                    disabled={!newFolder.trim()}
                                    bgColor={Colors.primary}
                                    onPress={() => {
                                        handleCreateFolder(newFolder);
                                    }}
                                />
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <FileViewer
                visible={viewerVisible}
                folder={viewerFile?.folder ?? ""}
                fileName={viewerFile?.name ?? ""}
                fileType={viewerFile?.type ?? ""}
                onClose={() => {
                    setViewerVisible(false);
                    setViewerFile(null);
                }}
            />
        </>
    );
}

function FileImagePreview({ uri }: { uri: string }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <View
            className="w-11 h-11 rounded-xl overflow-hidden items-center justify-center"
            style={{ backgroundColor: Colors.surfaceContainer }}
        >
            {loading && !error && (
                <ActivityIndicator
                    size="small"
                    color={Colors.primary}
                />
            )}

            {!error && (
                <Image
                    className="absolute inset-0 w-11 h-11"
                    source={{ uri }}
                    resizeMode="cover"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                />
            )}

            {error && (
                <Icon
                    name="FileImage"
                    size={20}
                    color={Colors.textSecondary}
                />
            )}
        </View>
    );
}