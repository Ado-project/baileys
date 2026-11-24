const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Función para crear y enviar Sticker + Audio (Método FFmpeg)
async function sendStickerWithAudio(sock, jid, mediaBuffer, isVideo = true) {
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const timestamp = Date.now();
    const inputPath = path.join(tmpDir, `input_${timestamp}.mp4`);
    const stickerPath = path.join(tmpDir, `sticker_${timestamp}.webp`);
    const audioPath = path.join(tmpDir, `audio_${timestamp}.ogg`);

    try {
        fs.writeFileSync(inputPath, mediaBuffer);
        const cmdSticker = `ffmpeg -y -i "${inputPath}" -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0" -c:v libwebp -quality 80 -loop 0 -an "${stickerPath}"`;
        const cmdAudio = `ffmpeg -y -i "${inputPath}" -vn -c:a libopus -ac 1 -avoid_negative_ts make_zero "${audioPath}"`;

        await new Promise((resolve, reject) => {
            exec(`${cmdSticker} && ${cmdAudio}`, (error) => {
                if (error) reject(new Error("FFmpeg falló: " + error.message));
                else resolve();
            });
        });

        await sock.sendMessage(jid, { sticker: { url: stickerPath } });
        await sock.sendMessage(jid, { audio: { url: audioPath }, mimetype: 'audio/ogg; codecs=opus', ptt: true });

    } finally {
        [inputPath, stickerPath, audioPath].forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
    }
}

// 2. Función para enviar Sticker Mod (El truco del Sidecar para el audio)
async function sendModdedSticker(sock, jid, quotedMessage, buffer) {
    const originalSticker = quotedMessage.stickerMessage;
    
    // Reconstruimos el mensaje con los metadatos inyectados
    const message = {
        stickerMessage: {
            url: originalSticker.url,
            fileSha256: originalSticker.fileSha256,
            fileEncSha256: originalSticker.fileEncSha256,
            mediaKey: originalSticker.mediaKey,
            mimetype: originalSticker.mimetype || "image/webp",
            directPath: originalSticker.directPath,
            fileLength: originalSticker.fileLength,
            mediaKeyTimestamp: originalSticker.mediaKeyTimestamp,
            isAnimated: originalSticker.isAnimated || true,
            stickerSentTs: Date.now().toString(),
            isAvatar: false,
            isAiSticker: false,
            isLottie: false,
            firstFrameLength: originalSticker.firstFrameLength, // Metadatos del audio
            firstFrameSidecar: originalSticker.firstFrameSidecar, // Metadatos del audio
            accessibilityLabel: ""
        }
    };

    await sock.sendMessage(jid, message);
}

// Exportamos las funciones
module.exports = {
    sendStickerWithAudio,
    sendModdedSticker
};
