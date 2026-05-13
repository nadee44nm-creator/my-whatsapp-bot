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

            

    // MENU
    if (msg === 'menu') {
        message.reply(
`🌟 AUTO MIRAJ ACADEMY 🌟

📚 පාඨමාලා මෙනුව:

1 - 🚗 Automobile Technician & Electrician (මාස 24)
2 - 🎨 Auto Painting Course (මාස 6 - NVQ Level 03)
3 - 💻 ICT NVQ Level 4 (මාස 6)
4 - 📄 ICT Certificate Course (Weekend - මාස 6)

👉 අදාළ number එක reply කරන්න`
        );
    }

    // OPTION 1
    else if (msg === '1') {
        message.reply(
`🚗 Automobile Technician & Electrician Course

⏳ කාලය: මාස 24  
✔️ Full Time Training  
✔️ Local & Foreign Job අවස්ථා`
        );
    }

    // OPTION 2
    else if (msg === '2') {
        message.reply(
`🎨 Auto Painting Course

⏳ කාලය: මාස 6  
✔️ NVQ Level 03  
✔️ Practical Training  
✔️ Job oriented course`
        );
    }

    // OPTION 3
    else if (msg === '3') {
        message.reply(
`💻 ICT NVQ Level 4 Course

⏳ කාලය: මාස 6  
✔️ TVEC පිළිගත් සහතිකය  
✔️ Job Training + IT Skills`
        );
    }

    // OPTION 4
    else if (msg === '4') {
        message.reply(
`📄 ICT Certificate Course

⏳ කාලය: මාස 6 (Weekend)  
✔️ Short Course  
✔️ Basic IT + Job Skills`
        );
    }

});

client.initialize();
            }

        } catch (err) {
            console.log('❌ Message Error:', err);
        }
    });
}

startBot();    ,,,,,me code ek fix karal denn