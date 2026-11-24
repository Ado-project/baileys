// ~/ado-baileys/lib/sticker.js
async function sendModdedSticker(sock, jid, originalSticker) {
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
            firstFrameLength: originalSticker.firstFrameLength, // Crucial para el audio
            firstFrameSidecar: originalSticker.firstFrameSidecar, // Crucial para el audio
            accessibilityLabel: ""
        }
    };
    await sock.sendMessage(jid, message);
}

module.exports = { sendModdedSticker, /* ... otras funciones ... */ };