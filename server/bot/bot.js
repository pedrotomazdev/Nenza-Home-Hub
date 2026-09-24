require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');
const PYTHON_API_URL = process.env.PYTHON_API_URL;

// Configuração do Bot
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HEALTH_API_URL = process.env.HEALTH_API_URL;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});



function askBrain(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            message: message
        });

        const req = http.request(PYTHON_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        }, (res) => {
            let body = "";

            res.on("data", chunk => body += chunk);

            res.on("end", () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on("error", reject);

        req.write(data);
        req.end();
    });
}

// Função para buscar dados da API local
function fetchHealthData() {
    return new Promise((resolve, reject) => {
        http.get(HEALTH_API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', err => reject(err));
    });
}

// Alterado para 'clientReady' conforme o aviso de depreciação
client.once('clientReady', () => {
    console.log(`🤖 nenzaBot online como ${client.user.tag}!`);
});

// Escuta as mensagens enviadas no servidor
client.on('messageCreate', async (message) => {
    // Log para depuração
    console.log(`Recebido: "${message.content}" de ${message.author.tag}`);

    // Ignora mensagens enviadas por bots
    if (message.author.bot) return;

    // Comando !ping
    if (message.content === '!ping') {
        return message.reply('🏓 Pong! nenzaBot operacional.');
    }

    if(message.content.startsWith('!ask ')) {
        const prompt = message.content.slice(5).trim();

        if (!prompt) {
            return message.reply('❌ Digite alguma coisa depois de `!ask`.');
        }

        const msgWait = await message.channel.send(
            '🧠 *Consultando o NenzaBrain...*'
        );

        try {
            const result = await askBrain(prompt);

            await msgWait.edit(
                `🧠 ${result.response}`
            );

        } catch (error) {
            console.error('Erro ao consultar NenzaBrain:', error);

            await msgWait.edit(
                '❌ Não consegui me comunicar com o NenzaBrain.'
            );
        }
    }

    // Comando !health e !status desenterrados e prontos pra rodar
    if (message.content === '!health' || message.content === '!status') {
        const msgWait = await message.channel.send('🔍 *Lendo sensores e métricas do NenzaHub...*');

        try {
            const data = await fetchHealthData();

            // Trata objetos de bateria e dados do Android com segurança
            const batteryText = typeof data.android?.battery === 'object'
                ? `${data.android.battery.percentage}%`
                : (data.android?.battery || 'N/A');

            // Monta o Card Estilizado (Embed)
            const embed = new EmbedBuilder()
                .setColor(data.status === 'ok' ? 0x00FF7F : 0xFF0000)
                .setTitle(`📊 Status do Servidor - ${data.server || 'NenzaHub'}`)
                .addFields(
                    { name: '💻 CPU', value: `${data.cpu?.cores || '?'} Cores | Temp: ${data.cpu?.temperature || 'N/A'}`, inline: true },
                    { name: '🧠 Memória', value: `${data.memory?.usedMB}MB / ${data.memory?.totalMB}MB (${data.memory?.usagePercent}%)`, inline: true },
                    { name: '⚡ Latência', value: `${data.latency?.serverProcessingMs || 0} ms (Ping: ${data.latency?.networkPingMs || 0} ms)`, inline: true },
                    { name: '🌡️ Térmica Geral', value: data.thermal && data.thermal !== 'Indisponível' ? `${data.thermal.averageTemp}°C (Máx: ${data.thermal.maxTemp}°C)` : 'N/A', inline: true },
                    { name: '🔋 Bateria', value: batteryText, inline: true },
                    { name: '📶 Wi-Fi', value: `${data.wifi?.ssid || 'N/A'} (${data.wifi?.signalPercent || 0}%)`, inline: true }
                )
                .setFooter({ text: `Uptime: ${Math.floor((data.uptime?.systemSeconds || 0) / 3600)}h | Nenza Corp` })
                .setTimestamp();

            await msgWait.delete();
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Erro na requisição /health:', error);
            await msgWait.edit('❌ Erro ao comunicar com a API do NenzaHub.');
        }
    }
});

client.login(DISCORD_TOKEN);