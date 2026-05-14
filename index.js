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
// ... (කේතයේ මුල කොටස එලෙසම තබන්න)

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

            const msgLower = text.toLowerCase().trim();

            // MAIN MENU & RESTART (0)
            if (msgLower === 'menu' || msgLower === '0' || msgLower === 'hi' || msgLower === 'hello') {
                await sock.sendMessage(from, {
                    text: `👋 Auto Miraj Academy වෙත සාදරයෙන් පිළිගන්නවා 💐\n\n📚 ඔබට අවශ්‍ය තොරතුරු තෝරන්න 👇\n\n1️⃣ Automobile Technician & Electrician Course (මාස 24)\n2️⃣ Auto Paint Training Program (මාස 6)\n3️⃣ ICT NVQ Level 4 (මාස 6)\n4️⃣ ICT සහතික පත්‍ර පාඨමාලාව (මාස 6)\n5️⃣ ශිෂ්‍යත්ව / Enrollment විස්තර\n6️⃣ Contact / අමතන්න\n\n0️⃣ 🔙 Main Menu / නැවත මෙනුව`
                });
            }
            // OPTION 1
            else if (msgLower === '1') {
                await sock.sendMessage(from, {
                    text: `🚗 Automobile Technician & Electrician Course\n\n⏳ කාලය: මාස 24\n✔️ Full Time Training\n✔️ Local & Foreign Job අවස්ථා\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // OPTION 2
            else if (msgLower === '2') {
                await sock.sendMessage(from, {
                    text: `🎨 Auto Paint Training Program\n\n⏳ කාලය: මාස 6\n✔️ NVQ Level 03\n✔️ Practical Training\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // OPTION 3
            else if (msgLower === '3') {
                await sock.sendMessage(from, {
                    text: `💻 ICT NVQ Level 4\n\n⏳ කාලය: මාස 6\n✔️ TVEC පිළිගත් සහතිකය\n✔️ Job Training + IT Skills\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // OPTION 4
            else if (msgLower === '4') {
                await sock.sendMessage(from, {
                    text: `📄 ICT සහතික පත්‍ර පාඨමාලාව\n\n⏳ කාලය: මාස 6 (Weekend)\n✔️ Basic IT + Job Skills\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // OPTION 5
            else if (msgLower === '5') {
                await sock.sendMessage(from, {
                    text: `🎓 ශිෂ්‍යත්ව / Enrollment විස්තර\n\nඅයදුම්පත් යොමු කිරීම සඳහා අවශ්‍ය ලියකියවිලි සහ ලියාපදිංචි වීමේ තොරතුරු අප ආයතනය විසින් ඔබට දැනුම් දෙනු ඇත.\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // OPTION 6
            else if (msgLower === '6') {
                await sock.sendMessage(from, {
                    text: `📞 අපව අමතන්න:\n\n☎️ 0372277787\n📱 0753557777\n\n0️⃣ Main Menu වෙත යාමට 0 reply කරන්න`
                });
            }
            // DEFAULT REPLY (ඕනෑම මැසේජ් එකකට)
            else {
                await sock.sendMessage(from, {
                    text: `ස්තූතියි පණිවිඩයට. ඔබව සම්බන්ධ කර ගැනීමට අප ආයතනයේ නියෝජිතයෙක් ඔබට ඉතා ඉක්මනින් ඇමතුමක් ලබා දෙනු ඇත. 📞\n\nඑතෙක් වැඩිදුර තොරතුරු දැන ගැනීමට "Menu" ලෙස reply කරන්න.`
                });
            }

        } catch (e) {
            console.log("Error in message handler:", e);
        }
    });

// ... (ඉතිරි කොටස එලෙසම තබන්න)
// මෙතනදී තමයි bot පටන් ගන්නේ
startBot();