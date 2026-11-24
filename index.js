const baileys = require('@whiskeysockets/baileys');

const stickerUtils = require('./lib/sticker');

module.exports = {
    ...baileys,
    default: baileys.default,
    ...stickerUtils
};
