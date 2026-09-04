import React, { useMemo } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

import vscodeIcons from "@iconify-json/vscode-icons/icons.json";

interface FileIconProps {
    mimeType?: string | null;
    size?: number;
}

const MIME_ICONS: Record<string, string> = {
    // Pasta
    "folder" : "default-folder",

    // JavaScript / TypeScript
    "application/javascript": "file-type-jss",
    "text/javascript": "file-type-jss",
    "application/typescript": "file-type-typescript",
    "text/typescript": "file-type-typescript",

    // Web
    "text/html": "file-type-html",
    "text/css": "file-type-css",
    "text/scss": "file-type-scss",

    // Backend
    "text/x-php": "file-type-php",
    "application/x-httpd-php": "file-type-php",
    "text/x-python": "file-type-python",

    // Dados / configuração
    "application/json": "file-type-json",
    "application/xml": "file-type-xml",
    "text/xml": "file-type-xml",
    "application/yaml": "file-type-yaml",
    "text/yaml": "file-type-yaml",

    // Shell
    "application/x-sh": "file-type-shell",
    "text/x-shellscript": "file-type-shell",

    // Banco
    "application/sql": "file-type-sql",

    // Documentação
    "text/markdown": "file-type-markdown",
    "text/plain": "default-file",

    // Imagens
    "image/png": "file-type-image",
    "image/jpeg": "file-type-image",
    "image/gif": "file-type-image",
    "image/webp": "file-type-image",
    "image/svg+xml": "file-type-svg",

    // Compactados
    "application/zip": "file-type-zip",
    "application/x-rar-compressed": "file-type-rar",
    "application/vnd.rar": "file-type-rar",
    "application/x-7z-compressed": "file-type-7zip",

    // Android
    "application/vnd.android.package-archive": "file-type-apk",

    // PDF
    "application/pdf": "file-type-pdf",

    // Vídeo
    "video/mp4": "file-type-video",
    "video/webm": "file-type-video",
    "video/x-msvideo": "file-type-video",

    // Áudio
    "audio/mpeg": "file-type-audio",
    "audio/wav": "file-type-audio",
    "audio/ogg": "file-type-audio",
};

function getIconId(mimeType?: string | null): string {
    if (!mimeType) {
        return "default-file";
    }

    return MIME_ICONS[mimeType.toLowerCase()] ?? "default-file";
}

export function FileIcon({
    mimeType,
    size = 32,
}: FileIconProps) {
    console.log(mimeType);
    const iconId = getIconId(mimeType);

    const xml = useMemo(() => {
        const icon = vscodeIcons.icons[
            iconId as keyof typeof vscodeIcons.icons
        ];

        if (!icon) {
            const fallback = vscodeIcons.icons["default-file"];

            if (!fallback) {
                return null;
            }

            return `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
            >
                ${fallback.body}
            </svg>
        `;
        }

        return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
        >
            ${icon.body}
        </svg>
    `;
    }, [iconId]);

    if (!xml) {
        return (
            <View
                style={{
                    width: size,
                    height: size,
                }}
            />
        );
    }

    return (
        <SvgXml
            xml={xml}
            width={size}
            height={size}
        />
    );
}