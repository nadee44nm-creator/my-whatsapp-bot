const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const qrcode = require('qrcode-terminal');

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

    // 📱 QR Code
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 Scan QR:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('✅ Bot Connected!');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log('🚪 Logged out');
            }
        }
    });

    // 💬 AUTO REPLY SECTION
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

            // 🤖 Auto Replies
            if (text?.toLowerCase().includes('hi')) {
                await sock.sendMessage(from, {
                    text: '👋 Hello! Auto Miraj Bot here 😄'
                });
            }

            else if (text?.toLowerCase().includes('hello')) {
                await sock.sendMessage(from, {
                    text: '👋 Hi there! How can I help you?'
                });
            }

            else if (text?.toLowerCase().includes('price')) {
                await sock.sendMessage(from, {
                    text: '💰 Please contact admin for price details.'
                });
            }

            else {
                await sock.sendMessage(from, {
                    text: '🤖 I am an auto reply bot. Type "hi" or "hello".'
                });
            }

        } catch (err) {
            console.log('Error:', err);
        }
    });
}

startBot();
