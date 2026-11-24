const baileys = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Función personalizada para enviar un Sticker + Audio (PTT)
 * @param {Object} sock - La instancia del socket de Baileys
 * @param {String} jid - El destinatario
 * @param {Buffer} mediaBuffer - El buffer del video o audio original
 * @param {Boolean} isVideo - true si es video, false si es solo audio
 */
async function sendStickerWithAudio(sock, jid, mediaBuffer, isVideo = true) {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const timestamp = Date.now();
    const inputPath = path.join(tmpDir, `input_${timestamp}.mp4`);
    const stickerPath = path.join(tmpDir, `sticker_${timestamp}.webp`);
    const audioPath = path.join(tmpDir, `audio_${timestamp}.ogg`);

    try {
        // Guardar el buffer de entrada
        fs.writeFileSync(inputPath, mediaBuffer);

        // Comandos de FFmpeg
        // 1. Convertir a sticker webp animado (sin audio)
        const cmdSticker = `ffmpeg -i "${inputPath}" -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0" -c:v libwebp -quality 80 -loop 0 -an "${stickerPath}"`;
        
        // 2. Extraer el audio a OGG/Opus (formato de nota de voz)
        const cmdAudio = `ffmpeg -i "${inputPath}" -vn -c:a libopus -ac 1 -avoid_negative_ts make_zero "${audioPath}"`;

        // Ejecutar FFmpeg
        await new Promise((resolve, reject) => {
            exec(`${cmdSticker} && ${cmdAudio}`, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Enviar el sticker
        await sock.sendMessage(jid, { sticker: { url: stickerPath } });
        
        // Enviar el audio como nota de voz
        await sock.sendMessage(jid, { 
            audio: { url: audioPath }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true 
        });

    } catch (error) {
        console.error('Error en sendStickerWithAudio:', error);
        throw error;
    } finally {
        // Limpieza de archivos temporales
        [inputPath, stickerPath, audioPath].forEach(p => { 
            if (fs.existsSync(p)) fs.unlinkSync(p); 
        });
    }
}

// Exportamos todo Baileys + nuestra nueva función
module.exports = {
    ...baileys,
    default: baileys.default,
    sendStickerWithAudio
};
