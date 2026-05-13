const express = require("express");
const app = express();

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const qrcode = require("qrcode-terminal");

// 🌐 KEEP ALIVE SERVER
app.get("/", (req, res) => {
    res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🌐 Server running on port", PORT);
});

// 🛡️ ERROR HANDLER
process.on("uncaughtException", (err) => {
    console.log("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.log("❌ Promise Error:", err);
});

// 🤖 START BOT
async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState("auth_session");

    const { version } =
        await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["Auto Reply Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    // 📱 CONNECTION UPDATE
    sock.ev.on("connection.update", (update) => {

        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("📱 Scan QR Code:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ Bot Connected Successfully!");
        }

        if (connection === "close") {

            const code =
                lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {
                console.log("⚠️ Reconnecting...");
                startBot();
            } else {
                console.log("🚪 Logged Out");
            }
        }
    });

    // 💬 MESSAGE RECEIVE
    sock.ev.on("messages.upsert", async (m) => {

        try {

            const message = m.messages[0];

            if (!message.message) return;
            if (message.key.fromMe) return;

            const from = message.key.remoteJid;

            const text =
                message.message.conversation ||
                message.message.extendedTextMessage?.text;

            if (!text) return;

            console.log("📩 Message:", text);

            const msg = text.toLowerCase();

            // 📚 MENU
            if (msg === "menu") {

                await sock.sendMessage(from, {
                    text:
`🌟 AUTO MIRAJ ACADEMY 🌟

📚 පාඨමාලා මෙනුව:

1 - 🚗 Automobile Technician & Electrician
2 - 🎨 Auto Painting Course
3 - 💻 ICT NVQ Level 4
4 - 📄 ICT Certificate Course

👉 Number එක reply කරන්න`
                });
            }

            // 🚗 OPTION 1
            else if (msg === "1") {

                await sock.sendMessage(from, {
                    text:
`🚗 Automobile Technician & Electrician

⏳ කාලය: මාස 24
✔️ Full Time Training
✔️ Local & Foreign Job Opportunities`
                });
            }

            // 🎨 OPTION 2
            else if (msg === "2") {

                await sock.sendMessage(from, {
                    text:
`🎨 Auto Painting Course

⏳ කාලය: මාස 6
✔️ NVQ Level 03
✔️ Practical Training`
                });
            }

            // 💻 OPTION 3
            else if (msg === "3") {

                await sock.sendMessage(from, {
                    text:
`💻 ICT NVQ Level 4

⏳ කාලය: මාස 6
✔️ TVEC Approved
✔️ Job Training + IT Skills`
                });
            }

            // 📄 OPTION 4
            else if (msg === "4") {

                await sock.sendMessage(from, {
                    text:
`📄 ICT Certificate Course

⏳ කාලය: මාස 6 (Weekend)
✔️ Basic IT Skills
✔️ Job Oriented`
                });
            }

        } catch (err) {

            console.log("❌ Message Error:", err);
        }
    });
}

// 🚀 RUN BOT
startBot();