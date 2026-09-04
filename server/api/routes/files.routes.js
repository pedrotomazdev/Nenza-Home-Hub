const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mime = require("mime-types");
const AdmZip = require("adm-zip");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);
const router = express.Router();

const filesPath = path.join(__dirname, "../../storage/files");

// Garante que a pasta storage/files exista
if (!fs.existsSync(filesPath)) {
    fs.mkdirSync(filesPath, { recursive: true });
}

// Listar todos os arquivos da raiz
router.get("/files", (req, res) => {
    try {
        const files = fs.readdirSync(filesPath).map((name) => {
            const filePath = path.join(filesPath, name);
            const stats = fs.statSync(filePath);

            return {
                name,
                size: stats.size,
                modifiedAt: stats.mtime.toISOString(),
                mimeType: mime.lookup(name) || "application/octet-stream",
            };
        });

        res.json({
            files,
        });
    } catch (error) {
        console.error("Erro ao listar arquivos:", error);

        res.status(500).json({
            error: "Não foi possível listar os arquivos.",
        });
    }
});

// Upload de arquivo ou extração de ZIP
router.post("/upload/:folder", (req, res) => {
    const { folder } = req.params;

    const folderPath = path.resolve(filesPath, folder);

    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({
            error: "Pasta não encontrada.",
        });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, folderPath);
        },

        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });

    const upload = multer({
        storage,
        limits: {
            fileSize: 2 * 1024 * 1024 * 1024, // Limite de 2GB por arquivo
        },
    });

    upload.single("file")(req, res, async (error) => {
        if (error) {
            console.error("Erro no upload:", error);

            return res.status(500).json({
                error: "Não foi possível enviar o arquivo.",
                details: error.message,
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "Nenhum arquivo enviado.",
            });
        }

        const isZip =
            req.file.mimetype === "application/zip" ||
            req.file.originalname.toLowerCase().endsWith(".zip");

        // ZIP
        if (isZip) {
            try {
                // 1. Tenta usar o comando nativo 'unzip' do Linux (super rápido e 0 consumo de RAM)
                await execPromise(`unzip -o -q "${req.file.path}" -d "${folderPath}"`);

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                console.log(`ZIP "${req.file.originalname}" extraído via unzip em "${folder}"`);

                return res.status(201).json({
                    message: "Pasta enviada e extraída com sucesso.",
                    type: "zip",
                    extracted: true,
                    file: {
                        name: req.file.originalname,
                        size: req.file.size,
                    },
                });
            } catch (unzipErr) {
                console.warn("Unzip nativo falhou, tentando fallback com AdmZip:", unzipErr.message);

                try {
                    // 2. Fallback caso 'unzip' não esteja instalado no sistema
                    const zip = new AdmZip(req.file.path);
                    zip.extractAllTo(folderPath, true);

                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(201).json({
                        message: "Pasta enviada e extraída com sucesso.",
                        type: "zip",
                        extracted: true,
                        file: {
                            name: req.file.originalname,
                            size: req.file.size,
                        },
                    });
                } catch (zipErr) {
                    console.error("Erro ao extrair ZIP com AdmZip:", zipErr);

                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(500).json({
                        error: "Não foi possível extrair o ZIP.",
                        details: zipErr.message,
                    });
                }
            }
        }

        // ARQUIVO NORMAL
        return res.status(201).json({
            message: "Arquivo enviado com sucesso.",
            type: "file",
            extracted: false,
            file: {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
            },
        });
    });
});

// Download de pasta inteira em formato ZIP
router.get("/folders/:folder(*)/download", (req, res) => {
    try {
        const { folder } = req.params;

        const folderPath = path.resolve(filesPath, folder);

        // Segurança contra path traversal
        if (!folderPath.startsWith(filesPath)) {
            return res.status(403).json({
                error: "Acesso à pasta não permitido.",
            });
        }

        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({
                error: "Pasta não encontrada.",
            });
        }

        const stats = fs.statSync(folderPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({
                error: "O caminho informado não é uma pasta.",
            });
        }

        const items = fs.readdirSync(folderPath);

        const zip = new AdmZip();

        if (items.length > 0) {
            zip.addLocalFolder(folderPath);
        } else {
            zip.addFile(".empty", Buffer.from(""));
        }

        const zipBuffer = zip.toBuffer();
        const folderNameOnly = path.basename(folder);

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(folderNameOnly)}.zip"`
        );
        res.setHeader("Content-Length", zipBuffer.length);

        return res.send(zipBuffer);
    } catch (error) {
        console.error("Erro ao gerar ZIP da pasta:", error);

        return res.status(500).json({
            error: "Não foi possível baixar a pasta.",
            details: error.message,
        });
    }
});

// Listar conteúdo de uma pasta
router.get("/folders/:folder", (req, res) => {
    try {
        const { folder } = req.params;

        const folderPath = path.resolve(filesPath, folder);

        if (!folderPath.startsWith(filesPath + path.sep)) {
            return res.status(403).json({
                error: "Acesso à pasta não permitido.",
            });
        }

        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({
                error: "Pasta não encontrada.",
            });
        }

        const stats = fs.statSync(folderPath);

        if (!stats.isDirectory()) {
            return res.status(400).json({
                error: "O caminho informado não é uma pasta.",
            });
        }

        const files = fs.readdirSync(folderPath).map((name) => {
            const filePath = path.join(folderPath, name);
            const stats = fs.statSync(filePath);

            return {
                name,
                type: stats.isDirectory() ? "folder" : "file",
                size: stats.isFile() ? stats.size : 0,
                modifiedAt: stats.mtime.toISOString(),
                mimeType: stats.isFile()
                    ? mime.lookup(name) || "application/octet-stream"
                    : null,
            };
        });

        res.json({
            folder,
            files,
        });
    } catch (error) {
        console.error("Erro ao listar pasta:", error);

        res.status(500).json({
            error: "Não foi possível listar a pasta.",
        });
    }
});

// Ler conteúdo de um arquivo em texto
router.get("/files/:folder/:filename", (req, res) => {
    try {
        const { folder, filename } = req.params;

        const folderPath = path.resolve(filesPath, folder);
        const filePath = path.resolve(folderPath, filename);

        // Impede acesso fora de storage/files
        if (!filePath.startsWith(folderPath + path.sep)) {
            return res.status(403).json({
                error: "Acesso ao arquivo não permitido.",
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "Arquivo não encontrado.",
            });
        }

        const stats = fs.statSync(filePath);

        if (!stats.isFile()) {
            return res.status(400).json({
                error: "O caminho informado não é um arquivo.",
            });
        }

        const content = fs.readFileSync(filePath, "utf-8");

        res.json({
            name: filename,
            content,
        });
    } catch (error) {
        console.error("Erro ao ler arquivo:", error);

        res.status(500).json({
            error: "Não foi possível ler o arquivo.",
        });
    }
});

module.exports = router;