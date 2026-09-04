const { PROTECTED_FOLDERS } = require("../../config/storage.config");

const express = require("express");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const router = express.Router();

const storagePath = path.join(__dirname, "../../storage/files");

// Garante que a pasta storage/files exista
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

//busca pasta principal
router.get("/folders", (req, res) => {
    try {
        const folders = fs
            .readdirSync(storagePath, { withFileTypes: true })
            .filter((item) => item.isDirectory())
            .map((item) => {
                const folderPath = path.join(storagePath, item.name);

                const items = fs.readdirSync(folderPath);

                return {
                    name: item.name,
                    itemCount: items.length,
                };
            });

        res.json({
            folders,
        });
    } catch (error) {
        console.error("Erro ao listar pastas:", error);

        res.status(500).json({
            error: "Não foi possível listar as pastas.",
        });
    }
});

// busca pastas e lista arquivos
router.get("/folders/:folder", (req, res) => {
    try {
        const { folder } = req.params;

        const folderPath = path.join(storagePath, folder);

        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({
                error: "Pasta não encontrada.",
            });
        }

        const items = fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter((item) => item.isFile())
            .map((item) => {
                const filePath = path.join(folderPath, item.name);
                const stats = fs.statSync(filePath);

                return {
                    name: item.name,
                    size: stats.size,
                    modifiedAt: stats.mtime.toISOString(),
                    mimeType:
                        mime.lookup(item.name) ||
                        "application/octet-stream",
                };
            });

        res.json({
            folder,
            files: items,
        });
    } catch (error) {
        console.error("Erro ao listar arquivos da pasta:", error);

        res.status(500).json({
            error: "Não foi possível listar os arquivos da pasta.",
        });
    }
});

// deleta pasta
router.delete("/folders/:folder", (req, res) => {
    const { folder } = req.params;

    if (PROTECTED_FOLDERS.includes(folder)) {
        return res.status(403).json({
            error: "Esta pasta é protegida e não pode ser excluída pelo NenzaHub.",
        });
    }

    const folderPath = path.join(storagePath, folder);

    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({
            error: "Pasta não encontrada.",
        });
    }

    fs.rmSync(folderPath, {
        recursive: true,
        force: true,
    });

    res.json({
        message: "Pasta excluída com sucesso.",
    });
});

// cria pasta
router.post("/folders", (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Nome da pasta é obrigatório.",
            });
        }

        const folderPath = path.join(storagePath, name.trim());

        if (fs.existsSync(folderPath)) {
            return res.status(409).json({
                error: "Esta pasta já existe.",
            });
        }

        fs.mkdirSync(folderPath);

        res.status(201).json({
            message: "Pasta criada com sucesso.",
            folder: {
                name: name.trim(),
            },
        });
    } catch (error) {
        console.error("Erro ao criar pasta:", error);

        res.status(500).json({
            error: "Não foi possível criar a pasta.",
        });
    }
});

module.exports = router;
