const {
    Sticker,
    StickerTypes
} = require('wa-sticker-formatter');

const {
    downloadMediaMessage
} = require('@whiskeysockets/baileys');

const MAX_VIDEO_SECONDS = 10;
const CONVERSION_TIMEOUT = 30000;

function unwrapMessage(content) {
    let current = content;

    while (current) {
        if (current.ephemeralMessage?.message) {
            current = current.ephemeralMessage.message;
            continue;
        }

        if (current.viewOnceMessage?.message) {
            current = current.viewOnceMessage.message;
            continue;
        }

        if (current.viewOnceMessageV2?.message) {
            current = current.viewOnceMessageV2.message;
            continue;
        }

        if (current.viewOnceMessageV2Extension?.message) {
            current =
                current.viewOnceMessageV2Extension.message;
            continue;
        }

        break;
    }

    return current || {};
}

module.exports = async ({
    message,
    sock,
    args
}) => {
    try {
        const contextInfo =
            message
                .message
                ?.extendedTextMessage
                ?.contextInfo;

        const quotedMessage =
            contextInfo?.quotedMessage;

        /*
         * Para baixar uma mensagem respondida, é importante
         * reconstruir a chave usando o ID e o participante
         * da mensagem original.
         */
        const targetMessage = quotedMessage
            ? {
                message: quotedMessage,

                key: {
                    remoteJid:
                        message.key.remoteJid,

                    id:
                        contextInfo.stanzaId,

                    participant:
                        contextInfo.participant,

                    fromMe:
                        false
                }
            }
            : message;

        const content =
            unwrapMessage(
                targetMessage.message
            );

        const isImage =
            Boolean(content.imageMessage);

        const isVideo =
            Boolean(content.videoMessage);

        if (!isImage && !isVideo) {
            return (
                '❌ Responda uma imagem ou vídeo com:\n\n' +
                '`,sticker` — grande e recortada\n' +
                '`,sticker full` — imagem inteira'
            );
        }

        if (isVideo) {
            const seconds =
                Number(
                    content.videoMessage.seconds || 0
                );

            if (seconds > MAX_VIDEO_SECONDS) {
                return (
                    '❌ Vídeo muito longo para figurinha ' +
                    `(máximo ${MAX_VIDEO_SECONDS}s).`
                );
            }
        }

        /*
         * Lê o texto depois do comando:
         *
         * ,sticker       => args vazio => CROPPED
         * ,sticker full  => args[0] é "full" => FULL
         */
        const mode =
            String(args?.[0] || '')
                .trim()
                .toLowerCase();

        const isFullMode =
            mode === 'full' ||
            mode === 'inteira' ||
            mode === 'completa';

        const stickerType =
            isFullMode
                ? StickerTypes.FULL
                : StickerTypes.CROPPED;

        const buffer =
            await downloadMediaMessage(
                targetMessage,
                'buffer',
                {},
                {
                    logger: undefined,

                    reuploadRequest:
                        sock.updateMediaMessage
                }
            );

        if (
            !Buffer.isBuffer(buffer) ||
            buffer.length === 0
        ) {
            return (
                '❌ Não consegui baixar a mídia. ' +
                'Tente novamente.'
            );
        }

        const sticker =
            new Sticker(
                buffer,
                {
                    pack:
                        'ISAAC-DITADOR',

                    author:
                        'jm-developer',

                    type:
                        stickerType,

                    quality:
                        isVideo
                            ? 30
                            : 80,

                    /*
                     * Fundo transparente para o modo FULL.
                     */
                    background:
                        '#00000000'
                }
            );

        const stickerBuffer =
            await Promise.race([
                sticker.toBuffer(),

                new Promise(
                    (_, reject) => {
                        setTimeout(
                            () => {
                                reject(
                                    new Error(
                                        'Timeout na conversão'
                                    )
                                );
                            },
                            CONVERSION_TIMEOUT
                        );
                    }
                )
            ]);

        if (
            !Buffer.isBuffer(stickerBuffer) ||
            stickerBuffer.length === 0
        ) {
            return (
                '❌ A conversão retornou uma ' +
                'figurinha vazia.'
            );
        }

        await sock.sendMessage(
            message.key.remoteJid,
            {
                sticker:
                    stickerBuffer
            },
            {
                quoted:
                    message
            }
        );

        return null;
    } catch (error) {
        console.error(
            'Erro ao criar figurinha:',
            error
        );

        return (
            '❌ Erro ao criar a figurinha. ' +
            'Se for vídeo, envie um arquivo menor.'
        );
    }
};