const express = require("express");
const cors = require("cors");
const path = require("path");

const healthRoutes = require("./api/routes/health.routes");
const filesRoutes = require("./api/routes/files.routes");
const foldersRoutes = require("./api/routes/folders.routes");

const app = express();
const PORT = process.env.PORT || 8080;

const storagePath = path.join(__dirname, "storage/files");

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.use("/api", healthRoutes);
app.use("/api", filesRoutes);
app.use("/api", foldersRoutes);

app.use("/storage", express.static(storagePath));

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔥 NenzaHub on FIRE running on port ${PORT}`);
});

// Configura timeouts longos para aguentar uploads pesados sem cair conexão
server.setTimeout(15 * 60 * 1000); // 15 minutos
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;