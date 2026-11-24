# ado-baileys

A lightweight WhatsApp Web API wrapper basado en **Baileys** (WhiskeySockets) con utilities/helpers para bots.

> Objetivo: reparar/estandarizar el paquete y ofrecer una API/README con funciones compatibles al estilo de forks como `natsu-dev01`.

---

## Requisitos

- Node.js: recomendado **>= 18**
- Un `WA Session` (persistencia) para no revalidar credenciales cada vez.
- Preferible: TypeScript si el proyecto lo usa (si no, igual sirve).

---

## Instalación

bash``` 

 npm i ado-baileys
```

o si usas git:

bash```
 
npm i git+https://github.com/SergioOficial/ado-baileys.git
```
---

## Uso rápido

### Ejemplo (con socket)
js const { createWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, } = require('ado-baileys');
async function start() { const { state, saveCreds } = await useMultiFileAuthState('./session');

const { version } = await fetchLatestBaileysVersion();

const sock = createWASocket({ auth: state, printQRInTerminal: true, version, });

sock.ev.on('creds.update', saveCreds);

sock.ev.on('messages.upsert', async ({ messages }) => { const m = messages?.[0]; if (!m.message) return;

console.log('Mensaje recibido:', m.key);
// Respuesta simple (ajusta según tu helper de envío)
// await sock.sendMessage(m.key.remoteJid, { text: 'Hola!' });
}); }

start();

Copy codeCopy Code
---

## Funciones / Helpers incluidas

El proyecto re-exporta o incluye helpers típicos de Baileys/forks para acelerar el desarrollo:

- `loadMessages` — carga/normaliza mensajes desde store más rápido.
- `getContentType` — detecta el tipo de contenido de un mensaje.
- `getDevice` — obtiene el device del mensaje si aplica.
- `makeCacheableSignalKeyStore` — optimiza el auth store con cache.
- `downloadContentFromMessage` — descarga contenido (media) a partir de un mensaje.

> Nota: los nombres exactos de exportación dependen de tu implementación actual.
> Cuando me pases el código (o tu `src/index.*`), te lo dejo 100% igual a tu API real.

---

## Utilidades recomendadas

### Media (descarga)

- Usa `downloadContentFromMessage` para obtener buffers/streams.
- Luego convierte el stream a `Buffer` si necesitas guardarlo.

Ejemplo conceptual:
js // const stream = await downloadContentFromMessage(message, type); // stream -> Buffer / fs.writeFileSync(...)
Copy codeCopy Code
---

## Sesiones (Auth)

Debes persistir credenciales en una carpeta (ej: `./session`):

- `useMultiFileAuthState('./session')`

Si quieres, puedo ayudarte a:
- asegurar que el guardado de credenciales siempre ocurra
- evitar problemas típicos de “Error: timed out / Replaced / session invalid”

---

## Troubleshooting

### “Cannot find module / syntax error”
- Revisar si tu paquete es ESM o CJS.
- Revisar versiones de Node y configuración de build.

### “Auth/credenciales se pierden”
- Verificar que se esté ejecutando `sock.ev.on('creds.update', saveCreds)`
- Verificar que `./session` exista y tenga permisos.

### “QR no aparece / no se actualiza”
- Revisar `printQRInTerminal: true`
- Revisar `version` con `fetchLatestBaileysVersion()`

---

## Contribuir

Pull requests son bienvenidas.

1. Fork
2. Crea una rama: `feat/fix-readme`
3. Commit: `git commit -m "Fix: ..."`
4. PR

---

## Licencia

MIT.