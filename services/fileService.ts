import { File, UploadType } from "expo-file-system";
import { API_URL } from "./api";
import { Linking, Platform } from "react-native";
import { NenzaFile, NenzaFolder } from "types/files";


export async function getFiles(): Promise<NenzaFile[]> {
    const response = await fetch(`${API_URL}/api/files/`);

    if (!response.ok) {
        throw new Error(`Erro ao listar arquivos: ${response.status}`);
    }

    const data = await response.json();

    return data.files;
}

export async function uploadFile(
    uri: string,
    name: string,
    mimeType?: string,
    folder?: string,
    onProgress?: (progress: number) => void
) {
    const finalMimeType =
        mimeType || "application/octet-stream";

    const isZip =
        finalMimeType === "application/zip" ||
        name.toLowerCase().endsWith(".zip");

    const uploadUrl =
        `${API_URL}/api/upload/${encodeURIComponent(folder ?? "Temp_files")}`;

    // WEB
    if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();

        const formData = new FormData();

        formData.append(
            "file",
            new Blob([blob], {
                type: finalMimeType || blob.type,
            }),
            name
        );

        const uploadResponse = await new Promise<{
            status: number;
            body: string;
        }>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress =
                        (event.loaded / event.total) * 100;

                    onProgress?.(progress);
                }
            };

            xhr.onload = () => {
                resolve({
                    status: xhr.status,
                    body: xhr.responseText,
                });
            };

            xhr.onerror = () => {
                reject(
                    new Error("Erro de conexão durante o upload.")
                );
            };

            xhr.onabort = () => {
                reject(new Error("Upload cancelado."));
            };

            xhr.open("POST", uploadUrl);
            xhr.send(formData);
        });

        if (
            uploadResponse.status < 200 ||
            uploadResponse.status >= 300
        ) {
            throw new Error(
                `Erro no upload (${uploadResponse.status}): ${uploadResponse.body}`
            );
        }

        try {
            return JSON.parse(uploadResponse.body);
        } catch {
            return uploadResponse.body;
        }
    }

    // ANDROID / IOS
    const file = new File(uri);

    const response = await file.upload(uploadUrl, {
        fieldName: "file",
        httpMethod: "POST",
        uploadType: UploadType.MULTIPART,
        mimeType: isZip
            ? "application/zip"
            : finalMimeType,
    });

    if (response.status < 200 || response.status >= 300) {
        throw new Error(
            `Erro no upload (${response.status}): ${response.body}`
        );
    }

    try {
        return JSON.parse(response.body);
    } catch {
        return response.body;
    }
}


// Baixar arquivo individual
export function downloadFile(folder: string, fileName: string) {
    const fileUrl = `${API_URL}/storage/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
    
    if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        Linking.openURL(fileUrl);
    }
}

// Baixar pasta inteira (ZIP)
export function downloadFolder(folderPath: string) {
    // encodeURI preserva as barras '/' para subpastas como 'Projetos/NenzaDex'
    const zipUrl = `${API_URL}/api/folders/${encodeURI(folderPath)}/download`;
    const cleanName = folderPath.split("/").pop() || folderPath;

    if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `${cleanName}.zip`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        Linking.openURL(zipUrl);
    }
}

export async function getFolders(): Promise<NenzaFolder[]> {
    const response = await fetch(`${API_URL}/api/folders`);

    if (!response.ok) {
        throw new Error(`Erro ao listar pastas: ${response.status}`);
    }

    const data = await response.json();

    return data.folders;
}


export async function getFolderFiles(
    folder: string
): Promise<NenzaFile[]> {
    const response = await fetch(
        `${API_URL}/api/folders/${encodeURIComponent(folder)}`
    );

    if (!response.ok) {
        throw new Error(
            `Erro ao listar arquivos da pasta: ${response.status}`
        );
    }

    const data = await response.json();

    return data.files;
}


export async function deleteFolder(folder: string) {
    const response = await fetch(
        `${API_URL}/api/folders/${encodeURIComponent(folder)}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.error || `Erro ao excluir pasta: ${response.status}`
        );
    }

    return await response.json();
}


export async function deleteFile(filePath: string) {
    const response = await fetch(
        `${API_URL}/api/folders/${encodeURIComponent(filePath)}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.error || `Erro ao excluir arquivo: ${response.status}`
        );
    }

    return await response.json();
}


export async function createFolder(name: string) {
    const response = await fetch(`${API_URL}/api/folders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
        }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
            data?.error || `Erro ao criar pasta: ${response.status}`
        );
    }

    return await response.json();
}