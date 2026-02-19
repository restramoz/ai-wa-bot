// index.js
require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const qrcode = require("qrcode-terminal");

const { generateAIResponse } = require("./services/ollama");
const { buildSystemPrompt, processAIResponse } = require("./agents/marketingAgent");
const { buildKnowledgeString, parseAssetTags } = require("./agents/knowledge");

// ─────────────────────────────────────────────
// SESSION MEMORY (Untuk Flow Percakapan)
// ─────────────────────────────────────────────
const userSessions = new Map();

function getSessionHistory(sender) {
  const session = userSessions.get(sender) || [];
  return session.slice(-6).join("\n");
}

function saveSessionHistory(sender, userMsg, aiMsg) {
  const session = userSessions.get(sender) || [];
  session.push(`User: ${userMsg}`);
  session.push(`AI: ${aiMsg}`);
  if (session.length > 10) session.shift();
  userSessions.set(sender, session);
}

// ─────────────────────────────────────────────
// START ENGINE
// ─────────────────────────────────────────────
async function startWhatsApp() {
  console.log("🚀 Starting WhatsApp Agent (QR mode)...");

  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["De Royal Nirwana AI", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // ───── CONNECTION HANDLER ─────
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📲 Scan QR berikut:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully");
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Connection closed.");

      if (shouldReconnect) {
        console.log("♻️ Reconnecting...");
        startWhatsApp();
      } else {
        console.log("🚫 Logged out. Delete /auth and scan again.");
      }
    }
  });

  // ───── MESSAGE HANDLER ─────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    if (!messages[0]) return;

    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    // 🚫 FILTER: Block Group Chats
    if (msg.key.remoteJid.endsWith("@g.us")) {
      console.log("⛔ Group message ignored");
      return;
    }

    // 🚫 FILTER: Block Status Updates
    if (msg.key.remoteJid === "status@broadcast") {
      console.log("⛔ Status update ignored");
      return;
    }

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (!text.trim()) return;

    console.log("\n📩 From:", sender);
    console.log("📝 Message:", text.trim());

    // Typing indicator
    await sock.sendPresenceUpdate("composing", sender);

    try {
      // 1️⃣ Build Knowledge + History + Time
      const knowledge = buildKnowledgeString();
      const history = getSessionHistory(sender);
      const time = new Date().toLocaleString("id-ID");

      // 2️⃣ Build System Prompt (3 parameters)
      const systemPrompt = buildSystemPrompt(knowledge, history, time);

      // 3️⃣ Generate AI Response
      const aiRaw = await generateAIResponse(systemPrompt, text);

      // 4️⃣ Process Response
      const { intent, finalText } = processAIResponse(text, aiRaw);
      const { cleanText, assets } = parseAssetTags(finalText);

      console.log("🎯 Intent:", intent);

      // 5️⃣ Save to Session Memory
      saveSessionHistory(sender, text, cleanText);

      // 6️⃣ Natural Delay
      await new Promise(r => setTimeout(r, 300 + Math.random() * 700));

      // 7️⃣ Send Text
      await sock.sendMessage(sender, { text: cleanText });

      // 8️⃣ Send Assets
      if (assets.length > 0) {
        console.log("📦 Asset Triggered:");
        for (const asset of assets) {
          console.log(`→ ${asset.tag} | ${asset.description}`);
          for (const filePath of asset.paths) {
            await new Promise(r => setTimeout(r, 200));
            if (asset.type === "image") {
              await sock.sendMessage(sender, { image: { url: filePath } });
            } else {
              await sock.sendMessage(sender, {
                document: { url: filePath },
                fileName: filePath.split("/").pop()
              });
            }
          }
        }
      }

    } catch (err) {
      console.error("❌ Handler Error:", err.message);
      await sock.sendMessage(sender, {
        text: "Maaf Kak, sistem lagi cek data dulu. Coba kirim ulang ya."
      });
    } finally {
      await sock.sendPresenceUpdate("available", sender);
    }
  });
}

startWhatsApp();