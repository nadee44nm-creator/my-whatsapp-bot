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

// 🌐 KEEP ALIVE SERVER
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🌐 Server running on port", PORT);
});

// 🛡️ CRASH HANDLER
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
            const text = message.message.conversation || message.message.extendedTextMessage?.text;

            if (!text) return;
            console.log('📩 Message from:', from, '| Text:', text);

            const msgLower = text.toLowerCase();

            // MENU
            if (msgLower === 'menu') {
                await sock.sendMessage(from, {
                    text: `🌟 AUTO MIRAJ ACADEMY 🌟\n\n📚 පාඨමාලා මෙනුව:\n\n1 - 🚗 Automobile Technician & Electrician (මාස 24)\n2 - 🎨 Auto Painting Course (මාස 6 - NVQ Level 03)\n3 - 💻 ICT NVQ Level 4 (මාස 6)\n4 - 📄 ICT Certificate Course (Weekend - මාස 6)\n\n👉 අදාළ number එක reply කරන්න`
                });
            }
            // OPTION 1
            else if (msgLower === '1') {
                await sock.sendMessage(from, {
                    text: `🚗 Automobile Technician & Electrician Course\n\n⏳ කාලය: මාස 24\n✔️ Full Time Training\n✔️ Local & Foreign Job අවස්ථා`
                });
            }
            // OPTION 2
            else if (msgLower === '2') {
                await sock.sendMessage(from, {
                    text: `🎨 Auto Painting Course\n\n⏳ කාලය: මාස 6\n✔️ NVQ Level 03\n✔️ Practical Training\n✔️ Job oriented course`
                });
            }
            // OPTION 3
            else if (msgLower === '3') {
                await sock.sendMessage(from, {
                    text: `💻 ICT NVQ Level 4 Course\n\n⏳ කාලය: මාස 6\n✔️ TVEC පිළිගත් සහතිකය\n✔️ Job Training + IT Skills`
                });
            }
            // OPTION 4
            else if (msgLower === '4') {
                await sock.sendMessage(from, {
                    text: `📄 ICT Certificate Course\n\n⏳ කාලය: මාස 6 (Weekend)\n✔️ Short Course\n✔️ Basic IT + Job Skills`
                });
            }
        } catch (e) {
            console.log("Error in message handler:", e);
        }
    });
}

// මෙතනදී තමයි bot පටන් ගන්නේ
startBot();