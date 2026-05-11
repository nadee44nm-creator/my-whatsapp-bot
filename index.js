const express = require("express");
const app = express();

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const qrcode = require('qrcode-terminal');

// 🌐 KEEP ALIVE SERVER (IMPORTANT for Railway/Render)
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Server running on port", PORT);
});

// 🛡️ CRASH HANDLER (IMPORTANT)
process.on("uncaughtException", (err) => {
    console.log("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.log("❌ Promise Error:", err);
});

// 🤖 BOT START
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Auto Reply Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    // 📱 CONNECTION
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 Scan QR Code:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Bot Connected Successfully!');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {
                console.log("⚠️ Reconnecting...");
                startBot();
            } else {
                console.log('🚪 Logged out');
            }
        }
    });

    // 💬 AUTO REPLY
    sock.ev.on('messages.upsert', async (msg) => {
        try {
            const message = msg.messages[0];

            if (!message.message) return;
            if (message.key.fromMe) return;

            const from = message.key.remoteJid;
            const text =
                message.message.conversation ||
                message.message.extendedTextMessage?.text;

            console.log('📩 Message:', text);

            if (!text) return;

            const msgLower = text.toLowerCase();

            if (msgLower.includes('hi')) {
                await sock.sendMessage(from, {
                    text: '👋 Hello! Auto Bot here 😄'
                });
            }

            else if (msgLower.includes('hello')) {
                await sock.sendMessage(from, {
                    text: '👋 Hi there! How can I help you?'
                });
            }

            else if (msgLower.includes('price')) {
                await sock.sendMessage(from, {
                    text: '💰 Please contact admin for price details.'
                });
            }

            else {
                await sock.sendMessage(from, {
                    text: '🤖 I am an auto reply bot. Type hi or hello.'
                });
            }

        } catch (err) {
            console.log('❌ Message Error:', err);
        }
    });
}

startBot();