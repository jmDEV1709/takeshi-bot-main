module.exports = async ({ message, sock }) => {
    try {

        const groupId = message.key.remoteJid;

        await sock.groupSettingUpdate(
            groupId,
            "announcement"
        );

        return "✅ Grupo fechado.";
    } catch (error) {
        console.error(error);
        return "❌ Erro ao fechar grupo.";
    }
};