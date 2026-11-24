const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

async function startAdo() {
    // Guardar sesión en la carpeta 'auth_info_ado'
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_ado');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startAdo();
            }
        } else if (connection === 'open') {
            console.log('¡Bot ado conectado con éxito!');
        }
    });

    // Manejo de mensajes básico
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const remitente = msg.key.remoteJid;

        if (texto === '!ping') {
            await sock.sendMessage(remitente, { text: '¡Pong! Soy el bot @ado' });
        }
    });
}

startAdo();
