export const FILE_ICONS = {
    // Mídia
    image: "FileImage",
    video: "FileVideo",
    audio: "AudioLines",

    // Documentos
    pdf: "FileText",
    document: "FileText",
    spreadsheet: "FileSpreadsheet",
    presentation: "Presentation",

    // Desenvolvimento
    code: "FileCode2",
    javascript: "FileJson2",
    typescript: "FileCode2",
    react: "Atom",
    html: "FileCode2",
    css: "FileCode2",
    scss: "FileCode2",
    php: "FileCode2",
    python: "FileCode2",
    java: "FileCode2",
    kotlin: "FileCode2",
    swift: "FileCode2",
    c: "FileCode2",
    cpp: "FileCode2",
    csharp: "FileCode2",
    go: "FileCode2",
    rust: "FileCode2",
    ruby: "FileCode2",
    shell: "SquareTerminal",

    // Dados / Configuração
    json: "FileJson2",
    xml: "FileCode2",
    yaml: "FileCode2",
    config: "Settings2",
    env: "KeyRound",
    sql: "Database",
    database: "Database",

    // Texto
    text: "FileType",
    markdown: "FileText",

    // Compactados
    archive: "FileArchive",

    // Android / executáveis
    apk: "Package",
    executable: "Cog",

    // Fontes
    font: "ALargeSmall",

    // Outros
    log: "ScrollText",
    certificate: "BadgeCheck",
    key: "KeyRound",

    // Sistema
    folder: "Folder",
    unknown: "File",
} as const;

export const MIME_ICONS: Record<string, keyof typeof FILE_ICONS> = {
    // =========================
    // IMAGENS
    // =========================
    "image/jpeg": "image",
    "image/png": "image",
    "image/gif": "image",
    "image/webp": "image",
    "image/svg+xml": "image",
    "image/heic": "image",
    "image/heif": "image",
    "image/avif": "image",
    "image/bmp": "image",
    "image/tiff": "image",
    "image/x-icon": "image",

    // =========================
    // VÍDEOS
    // =========================
    "video/mp4": "video",
    "video/mpeg": "video",
    "video/quicktime": "video",
    "video/webm": "video",
    "video/x-msvideo": "video",
    "video/x-matroska": "video",

    // =========================
    // ÁUDIO
    // =========================
    "audio/mpeg": "audio",
    "audio/wav": "audio",
    "audio/x-wav": "audio",
    "audio/ogg": "audio",
    "audio/aac": "audio",
    "audio/flac": "audio",
    "audio/mp4": "audio",
    "audio/webm": "audio",

    // =========================
    // PDF
    // =========================
    "application/pdf": "pdf",

    // =========================
    // DOCUMENTOS
    // =========================
    "application/msword": "document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "document",
    "application/rtf": "document",
    "text/rtf": "document",

    // =========================
    // PLANILHAS
    // =========================
    "application/vnd.ms-excel": "spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "spreadsheet",
    "text/csv": "spreadsheet",

    // =========================
    // APRESENTAÇÕES
    // =========================
    "application/vnd.ms-powerpoint": "presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "presentation",

    // =========================
    // JAVASCRIPT / TYPESCRIPT
    // =========================
    "application/javascript": "javascript",
    "text/javascript": "javascript",
    "application/x-javascript": "javascript",
    "application/typescript": "typescript",

    // =========================
    // WEB
    // =========================
    "text/html": "html",
    "text/css": "css",
    "text/scss": "scss",
    "text/x-scss": "scss",

    // =========================
    // DADOS / CONFIG
    // =========================
    "application/json": "json",
    "application/ld+json": "json",
    "application/xml": "xml",
    "text/xml": "xml",

    "application/x-yaml": "yaml",
    "text/yaml": "yaml",

    // =========================
    // PHP
    // =========================
    "application/x-httpd-php": "php",

    // =========================
    // PYTHON
    // =========================
    "text/x-python": "python",

    // =========================
    // JAVA / JVM
    // =========================
    "text/x-java-source": "java",

    // =========================
    // C / C++ / C#
    // =========================
    "text/x-c": "c",
    "text/x-c++": "cpp",
    "text/x-csharp": "csharp",

    // =========================
    // OUTRAS LINGUAGENS
    // =========================
    "text/x-go": "go",
    "text/x-rust": "rust",
    "text/x-ruby": "ruby",

    // =========================
    // SHELL
    // =========================
    "application/x-sh": "shell",
    "text/x-shellscript": "shell",

    // =========================
    // SQL
    // =========================
    "application/sql": "sql",

    // =========================
    // TEXTO
    // =========================
    "text/plain": "text",
    "text/markdown": "markdown",

    // =========================
    // FONTES
    // =========================
    "font/ttf": "font",
    "font/otf": "font",
    "font/woff": "font",
    "font/woff2": "font",

    // =========================
    // COMPACTADOS
    // =========================
    "application/zip": "archive",
    "application/x-zip-compressed": "archive",
    "application/x-rar-compressed": "archive",
    "application/vnd.rar": "archive",
    "application/x-7z-compressed": "archive",
    "application/gzip": "archive",
    "application/x-gzip": "archive",
    "application/x-tar": "archive",
    "application/x-bzip2": "archive",

    // =========================
    // ANDROID
    // =========================
    "application/vnd.android.package-archive": "apk",

    // =========================
    // CERTIFICADOS / CHAVES
    // =========================
    "application/x-pem-file": "certificate",
    "application/pkcs12": "certificate",
    "application/x-pkcs12": "certificate",
};


export const SYSTEM_FOLDERS: Record<
    string,
    {
        default: string;
        active: string;
        deletable: boolean;
    }
> = {
    Backups: {
        default: "DatabaseBackup",
        active: "DatabaseBackup",
        deletable: false,
    },
    Projetos: {
        default: "FolderCode",
        active: "FolderCode",
        deletable: false,
    },
    Imagens: {
        default: "Images",
        active: "Images",
        deletable: false,
    },
    Documentos: {
        default: "StickyNotes",
        active: "StickyNotes",
        deletable: false,
    }
};


export interface NenzaFile {
    name: string;
    size: number;
    modifiedAt: string;
    mimeType: string;
}

export interface NenzaFolder {
    name: string,
    itemCount: number
}
