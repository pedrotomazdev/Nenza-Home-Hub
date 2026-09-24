const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Caminho do armazenamento persistente do banco JSON no servidor
const storageDir = path.join(__dirname, "../../storage");
const dbFilePath = path.join(storageDir, "sync_db.json");

// Garante que o diretório de storage exista
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

// Estrutura inicial padrão do banco do Hub
const defaultDb = {
    users: [],
    pets: [],
    products: [],
    shopping_lists: [],
    shopping_list_items: [],
    activities: [],
    house_bills: [],
    bill_payments: [],
    house_tasks: [],
    house_task_completions: [],
};

// Lê a base de dados do disco
function readDb() {
    try {
        if (!fs.existsSync(dbFilePath)) {
            fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2), "utf-8");
            return JSON.parse(JSON.stringify(defaultDb));
        }
        const raw = fs.readFileSync(dbFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        return { ...defaultDb, ...parsed };
    } catch (error) {
        console.error("[Sync] Erro ao ler banco sync_db.json:", error);
        return JSON.parse(JSON.stringify(defaultDb));
    }
}

// Salva a base de dados de forma segura no disco
function saveDb(data) {
    try {
        const tempPath = `${dbFilePath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
        fs.renameSync(tempPath, dbFilePath);
    } catch (error) {
        console.error("[Sync] Erro ao salvar banco sync_db.json:", error);
    }
}

// Normaliza datas para comparação ISO
function normalizeDate(dateStr) {
    if (!dateStr) return "";
    return String(dateStr).trim().replace(" ", "T");
}

// Obtém o timestamp de alteração de um registro
function getItemTimestamp(item) {
    return normalizeDate(item.updated_at || item.completed_at || item.created_at || item.paid_at || "");
}

// Realiza o merge dos registros locais recebidos com o banco do Hub
function mergeTable(serverList = [], clientList = []) {
    const map = new Map();

    // 1. Carrega os registros existentes no servidor
    for (const item of serverList) {
        if (item && item.id !== undefined && item.id !== null) {
            map.set(String(item.id), item);
        }
    }

    // 2. Mescla/Atualiza com os dados enviados pelo cliente
    for (const clientItem of clientList) {
        if (!clientItem || clientItem.id === undefined || clientItem.id === null) continue;

        const key = String(clientItem.id);
        const existing = map.get(key);

        if (!existing) {
            map.set(key, clientItem);
        } else {
            const serverTime = getItemTimestamp(existing);
            const clientTime = getItemTimestamp(clientItem);

            // Se o dado do cliente for mais novo ou de igual timestamp, atualiza
            if (clientTime >= serverTime) {
                map.set(key, { ...existing, ...clientItem });
            }
        }
    }

    return Array.from(map.values());
}

// Filtra registros que foram alterados após determinado timestamp
function getChangesSince(list = [], sinceIso) {
    if (!sinceIso) return list;
    const sinceNorm = normalizeDate(sinceIso);
    return list.filter((item) => {
        const itemTime = getItemTimestamp(item);
        return itemTime > sinceNorm;
    });
}

/**
 * POST /api/sync/exchange
 * Rota principal de troca bidirecional (Delta Sync)
 */
router.post("/sync/exchange", (req, res) => {
    try {
        const serverTime = new Date().toISOString();
        const { last_synced_at, changes = {} } = req.body;

        const db = readDb();

        const tables = [
            "users",
            "pets",
            "products",
            "shopping_lists",
            "shopping_list_items",
            "activities",
            "house_bills",
            "bill_payments",
            "house_tasks",
            "house_task_completions",
        ];

        // 1. Aplica e mescla as alterações enviadas pelo cliente
        for (const table of tables) {
            const incoming = changes[table] || [];
            if (incoming.length > 0) {
                db[table] = mergeTable(db[table] || [], incoming);
            }
        }

        // Salva as alterações mescladas no disco
        saveDb(db);

        // 2. Coleta as alterações do servidor para enviar de volta ao cliente
        const responseChanges = {};
        for (const table of tables) {
            responseChanges[table] = getChangesSince(db[table] || [], last_synced_at);
        }

        console.log(`[Sync] ✅ Sincronização executada em ${serverTime}. Cliente sync_at: ${last_synced_at || "Primeiro Sync"}`);

        return res.json({
            success: true,
            server_time: serverTime,
            changes: responseChanges,
        });
    } catch (error) {
        console.error("[Sync] ❌ Erro durante o processamento de sync:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Erro interno no servidor ao sincronizar.",
        });
    }
});

/**
 * GET /api/sync/status
 * Rota para inspecionar quantidade de registros armazenados no Hub
 */
router.get("/sync/status", (req, res) => {
    try {
        const db = readDb();
        const counts = {};
        for (const key of Object.keys(db)) {
            counts[key] = Array.isArray(db[key]) ? db[key].length : 0;
        }

        return res.json({
            status: "online",
            counts,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/sync/reset
 * Rota para limpar base de sincronização do Hub se necessário
 */
router.post("/sync/reset", (req, res) => {
    try {
        saveDb(defaultDb);
        return res.json({ success: true, message: "Base de sincronização resetada com sucesso." });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;