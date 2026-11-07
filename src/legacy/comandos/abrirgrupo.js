module.exports = async ({ message, sock }) => {
    try {

        const groupId = message.key.remoteJid;

        await sock.groupSettingUpdate(
            groupId,
            "not_announcement"
        );

        return "✅ Grupo aberto.";
    } catch (error) {
        console.error(error);
        return "❌ Erro ao abrir grupo.";
    }
};