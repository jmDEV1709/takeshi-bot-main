import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuMessage } from "../../menu.js";

export default {
  name: "menu",
  description: "Menu de comandos",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    remoteJid,
    sendReply,
    sendSuccessReact,
    sendImageFromFile,
    sendGifFromFile,
  }) => {
    await sendSuccessReact();

    await sendReply(menuMessage(remoteJid));

    // =========================================================================
    // [FOTO DO MENU - DESATIVADA / COMENTADA]
    // Para voltar a enviar imagem junto com o menu, descomente o bloco abaixo
    // e troque "takeshi-bot.png" pelo nome do novo arquivo em ASSETS_DIR/images:
    //
    // await sendImageFromFile(
    //   path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
    //   `\n\n${menuMessage(remoteJid)}`,
    // );
    // =========================================================================
  },
};
