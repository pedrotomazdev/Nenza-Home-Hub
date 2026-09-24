const express = require("express");
const os = require("os");
const fs = require("fs");
const { execSync, exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);
const router = express.Router();

function getCommandOutput(cmd) {
    try {
        return execSync(`${cmd} 2>/dev/null`, { timeout: 1000 }).toString().trim();
    } catch {
        return null;
    }
}

function getAllSensorsAverage() {
    try {
        const thermalDir = "/sys/class/thermal";
        if (!fs.existsSync(thermalDir)) return null;

        const zones = fs.readdirSync(thermalDir).filter(name => name.startsWith("thermal_zone"));
        
        let validTemperatures = [];
        let sensorDetails = {};

        for (const zone of zones) {
            try {
                const zonePath = `${thermalDir}/${zone}`;
                const typePath = `${zonePath}/type`;
                const tempPath = `${zonePath}/temp`;

                if (!fs.existsSync(typePath) || !fs.existsSync(tempPath)) continue;

                const zoneType = fs.readFileSync(typePath, "utf-8").trim();
                const rawTemp = fs.readFileSync(tempPath, "utf-8").trim();
                
                let temp = parseFloat(rawTemp);

                // Converte de miligraus (ex: 35000) para Celsius (35.0)
                if (temp > 1000) temp = temp / 1000;

                // FILTRO DE SANEAMENTO:
                // Descarta sensores com erros conhecidos do kernel:
                // - Menores ou iguais a 0°C
                // - Maiores que 90°C (como os 100°C fixos de trava de segurança)
                if (temp > 0 && temp < 90) {
                    validTemperatures.push(temp);
                    sensorDetails[zoneType] = Number(temp.toFixed(1));
                }
            } catch {}
        }

        if (validTemperatures.length === 0) return null;

        // Cálculo da Média Simples
        const totalSum = validTemperatures.reduce((acc, curr) => acc + curr, 0);
        const average = totalSum / validTemperatures.length;

        return {
            averageTemp: Number(average.toFixed(1)),
            sensorsCount: validTemperatures.length,
            minTemp: Number(Math.min(...validTemperatures).toFixed(1)),
            maxTemp: Number(Math.max(...validTemperatures).toFixed(1)),
            sensors: sensorDetails // Lista todos os sensores válidos e suas temperaturas
        };
    } catch {
        return null;
    }
}

function getCpuCores() {
    const nodeCores = os.cpus().length;
    if (nodeCores > 0) return nodeCores;

    try {
        const nproc = getCommandOutput("nproc");
        if (nproc) return parseInt(nproc, 10);
    } catch {}

    try {
        const cpuCount = getCommandOutput("ls -d /sys/devices/system/cpu/cpu[0-9]* | wc -l");
        if (cpuCount) return parseInt(cpuCount, 10);
    } catch {}

    return "Indisponível";
}

// Temperatura da CPU lendo apenas zonas térmicas válidas de processador no Android
function getCpuTemperature() {
    try {
        const thermalDir = "/sys/class/thermal";
        if (!fs.existsSync(thermalDir)) return null;

        const zones = fs.readdirSync(thermalDir).filter(name => name.startsWith("thermal_zone"));
        let cpuTemps = [];

        for (const zone of zones) {
            try {
                const zonePath = `${thermalDir}/${zone}`;
                const typePath = `${zonePath}/type`;
                const tempPath = `${zonePath}/temp`;

                if (!fs.existsSync(typePath) || !fs.existsSync(tempPath)) continue;

                const zoneType = fs.readFileSync(typePath, "utf-8").trim().toLowerCase();

                // Filtra apenas sensores que contenham 'cpu', 'soc' ou 'tsens'
                // E ignora sensores genéricos, de bateria ou virtuais
                const isCpuZone = (
                    zoneType.includes("cpu") || 
                    zoneType.includes("soc") || 
                    zoneType.includes("tsens_tz")
                ) && !zoneType.includes("battery");

                if (isCpuZone) {
                    const rawTemp = fs.readFileSync(tempPath, "utf-8").trim();
                    let temp = parseFloat(rawTemp);

                    // Converte de miligraus para Celsius se necessário
                    if (temp > 1000) temp = temp / 1000;

                    // Descarte de leituras irrealistas (como 100°C fixo ou valores negativos)
                    if (temp > 0 && temp < 95) {
                        cpuTemps.push(temp);
                    }
                }
            } catch {}
        }

        if (cpuTemps.length === 0) return null;

        // Tira a média ou pega a maior temperatura entre os núcleos reais da CPU
        const maxCpuTemp = Math.max(...cpuTemps);
        return Number(maxCpuTemp.toFixed(1));
    } catch {
        return null;
    }
}

// Mede o ping para o DNS da Cloudflare (1.1.1.1)
async function getNetworkPing() {
    try {
        const { stdout } = await execPromise("ping -c 1 -w 1 1.1.1.1 2>/dev/null");
        const match = stdout.match(/time=([\d.]+)\s*ms/);
        return match ? parseFloat(match[1]) : "Sem conexão";
    } catch {
        return "Offline";
    }
}

// Informações detalhadas do Wi-Fi via Termux-API
function getWifiInfo() {
    const rawWifi = getCommandOutput("termux-wifi-connectioninfo");
    if (!rawWifi) return null;

    try {
        const wifi = JSON.parse(rawWifi);
        if (wifi.supplicant_state !== "COMPLETED" && !wifi.ssid) {
            return null;
        }

        // Calcula porcentagem do sinal a partir do RSSI (dBm)
        let signalPercent = null;
        if (wifi.rssi) {
            if (wifi.rssi <= -100) signalPercent = 0;
            else if (wifi.rssi >= -50) signalPercent = 100;
            else signalPercent = Math.round(2 * (wifi.rssi + 100));
        }

        return {
            ssid: wifi.ssid ? wifi.ssid.replace(/"/g, "") : "Wi-Fi Desconhecido",
            bssid: wifi.bssid,
            ip: wifi.ip,
            rssi: wifi.rssi,
            signalPercent: signalPercent,
            linkSpeedMbps: wifi.link_speed_mbps || null,
            frequencyMhz: wifi.frequency_mhz || null,
            is5GHz: wifi.frequency_mhz ? wifi.frequency_mhz > 4900 : false
        };
    } catch {
        return null;
    }
}

// Leitura de bytes trafegados da rede (I/O)
function getNetworkTraffic() {
    try {
        const netDev = fs.readFileSync("/proc/net/dev", "utf-8");
        const lines = netDev.split("\n");
        let totalRxBytes = 0;
        let totalTxBytes = 0;

        for (const line of lines) {
            if (line.includes(":") && !line.includes("lo:")) {
                const parts = line.trim().split(/\s+/);
                const rx = parseInt(parts[1], 10) || 0;
                const tx = parseInt(parts[9], 10) || 0;
                totalRxBytes += rx;
                totalTxBytes += tx;
            }
        }

        return {
            receivedMB: Number((totalRxBytes / 1024 / 1024).toFixed(2)),
            transmittedMB: Number((totalTxBytes / 1024 / 1024).toFixed(2))
        };
    } catch {
        return null;
    }
}

// ROTA PRINCIPAL DE HEALTH & MÉTRICAS
router.get("/health", async (req, res) => {
    const start = process.hrtime.bigint();

    // Dispara a checagem de ping assíncrona
    const pingPromise = getNetworkPing();

    const memoryTotal = os.totalmem();
    const memoryFree = os.freemem();
    const memoryUsed = memoryTotal - memoryFree;

    // Leitura da Bateria via Termux-API
    let batteryInfo = null;
    const rawBattery = getCommandOutput("termux-battery-status");
    if (rawBattery) {
        try {
            const parsed = JSON.parse(rawBattery);
            batteryInfo = {
                percentage: parsed.percentage,
                plugged: parsed.plugged,
                status: parsed.status,
                temperature: parsed.temperature
            };
        } catch {}
    }

    // Leitura do Disco
    const diskRaw = getCommandOutput("df -h /data | tail -1");
    let diskInfo = null;
    if (diskRaw) {
        const parts = diskRaw.split(/\s+/);
        diskInfo = {
            total: parts[1],
            used: parts[2],
            available: parts[3],
            usagePercent: parts[4]
        };
    }

    // Informações extras
    const wifiInfo = getWifiInfo();
    const cpuTemp = getCpuTemperature();
    const allSensors = getAllSensorsAverage(); // Leitura da média global de sensores
    const netTraffic = getNetworkTraffic();

    // Aguarda o resultado do ping
    const pingMs = await pingPromise;

    const end = process.hrtime.bigint();
    const responseTimeMs = Number(end - start) / 1e6;

    res.json({
        status: "ok",
        server: "NenzaHub",

        latency: {
            serverProcessingMs: Number(responseTimeMs.toFixed(2)),
            networkPingMs: pingMs
        },

        uptime: {
            processSeconds: Math.floor(process.uptime()),
            systemSeconds: Math.floor(os.uptime())
        },

        memory: {
            totalMB: Math.round(memoryTotal / 1024 / 1024),
            freeMB: Math.round(memoryFree / 1024 / 1024),
            usedMB: Math.round(memoryUsed / 1024 / 1024),
            usagePercent: Number(((memoryUsed / memoryTotal) * 100).toFixed(2))
        },

        cpu: {
            cores: getCpuCores(),
            model: os.cpus()[0]?.model || "Android ARM CPU",
            loadAvg: os.loadavg(),
            temperature: cpuTemp ? `${cpuTemp}°C` : "N/A"
        },

        // Nova chave contendo as métricas combinadas e detalhadas dos sensores
        thermal: allSensors || "Indisponível",

        wifi: wifiInfo || {
            ssid: "Não disponível",
            signalPercent: 0,
            linkSpeedMbps: 0,
            ip: "127.0.0.1"
        },

        networkTraffic: netTraffic || {
            receivedMB: 0,
            transmittedMB: 0
        },

        system: {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            nodeVersion: process.version
        },

        android: {
            battery: batteryInfo || "Termux-API não instalada",
            disk: diskInfo || "não foi possível ler"
        },

        timestamp: new Date().toISOString()
    });
});

// AÇÃO RÁPIDA: Reiniciar servidor Node (O PM2 sobe de volta em 1 segundo)
router.post("/server/restart", (req, res) => {
    res.json({
        message: "Reiniciando servidor NenzaHub...",
        status: "restarting"
    });

    setTimeout(() => {
        console.log("Reinicialização solicitada via API...");
        process.exit(0);
    }, 500);
});

// AÇÃO RÁPIDA: Ping sob demanda
router.get("/server/ping", async (req, res) => {
    const pingMs = await getNetworkPing();
    res.json({
        pingMs,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;