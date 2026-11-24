import { PREFIX } from "../../config.js";

export default {
  name: "inspecionar",
  description: "Mostra o JSON interno da mensagem citada",
  commands: ["inspecionar", "inspect", "raw"],
  usage: `${PREFIX}inspecionar`,
  handle: async ({ webMessage, sendReply }) => {
    const ctx =
      webMessage?.message?.extendedTextMessage?.contextInfo ||
      webMessage?.message?.imageMessage?.contextInfo ||
      webMessage?.message?.stickerMessage?.contextInfo;

    const quoted = ctx?.quotedMessage;
    if (!quoted) {
      await sendReply("Responda à figurinha com som usando /inspecionar");
      return;
    }

    const json = JSON.stringify(quoted, null, 2);
    console.log("[INSPECT STICKER]", json);
    await sendReply("```json\n" + json.slice(0, 3500) + "\n```");
  },
};