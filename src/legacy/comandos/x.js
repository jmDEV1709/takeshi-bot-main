const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');
const { twitter } = require('@bochilteam/scraper-twitter');

const MAX_VIDEO_SIZE = 60 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 120000;
const TEMP_MEDIA_DIR = path.join(__dirname, '..', 'media', 'temp');

function isValidXUrl(value) {
    try {
        const url = new URL(value);

        const allowedHosts = [
            'x.com',
            'www.x.com',
            'twitter.com',
            'www.twitter.com',
            'mobile.twitter.com'
        ];

        const validHost = allowedHosts.includes(
            url.hostname.toLowerCase()
        );

        const validPath = /\/status\/\d+/i.test(url.pathname);

        return validHost && validPath;
    } catch {
        return false;
    }
}

async function ensureTempDir() {
    await fs.promises.mkdir(TEMP_MEDIA_DIR, { recursive: true });
}

function getBestTwitterVariant(variants) {
    if (!Array.isArray(variants) || variants.length === 0) {
        throw new Error('VIDEO_NOT_FOUND');
    }

    const mp4Variants = variants.filter((variant) =>
        String(variant?.content_type || '').includes('video/mp4')
    );

    const candidates = mp4Variants.length > 0
        ? mp4Variants
        : variants;

    const sortedByBitrate = [...candidates].sort(
        (first, second) =>
            Number(second.bitrate || 0) -
            Number(first.bitrate || 0)
    );

    const best = sortedByBitrate[0];

    if (!best?.url) {
        throw new Error('VIDEO_NOT_FOUND');
    }

    return best.url;
}

async function resolveXVideoUrl(tweetUrl) {
    const variants = await twitter(tweetUrl);
    return getBestTwitterVariant(variants);
}

async function downloadVideoToFile(downloadUrl, outputPath) {
    const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
        timeout: DOWNLOAD_TIMEOUT,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 300
    });

    const contentLength = Number(
        response.headers['content-length'] || 0
    );

    if (contentLength && contentLength > MAX_VIDEO_SIZE) {
        throw new Error('FILE_TOO_LARGE');
    }

    let downloadedBytes = 0;

    response.data.on('data', (chunk) => {
        downloadedBytes += chunk.length;

        if (downloadedBytes > MAX_VIDEO_SIZE) {
            response.data.destroy(new Error('FILE_TOO_LARGE'));
        }
    });

    await pipeline(
        response.data,
        fs.createWriteStream(outputPath)
    );
}

module.exports = async ({ args, message, sock }) => {
    const remoteJid = message.key.remoteJid;
    const link = args?.[0]?.trim();

    if (!link) {
        return (
            '❌ Envie o link do vídeo do X.\n\n' +
            'Exemplo:\n' +
            ',x https://x.com/usuario/status/123456789'
        );
    }

    if (!isValidXUrl(link)) {
        return (
            '❌ Link inválido.\n\n' +
            'Use um link de publicação do X ou Twitter:\n' +
            'https://x.com/usuario/status/...'
        );
    }

    let tempFilePath;

    try {
        await sock.sendMessage(
            remoteJid,
            {
                text:
                    '⏳ Baixando o vídeo do X. Aguarde...'
            },
            {
                quoted: message
            }
        );

        await ensureTempDir();

        tempFilePath = path.join(
            TEMP_MEDIA_DIR,
            `x-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`
        );

        const downloadUrl = await resolveXVideoUrl(link);

        await downloadVideoToFile(
            downloadUrl,
            tempFilePath
        );

        await sock.sendMessage(
            remoteJid,
            {
                video: { url: tempFilePath },
                mimetype: 'video/mp4',
                caption:
                    '🐦 *Vídeo baixado do X*\n' +
                    '🤖 JM Bot'
            },
            {
                quoted: message
            }
        );

        await fs.promises.unlink(tempFilePath);
        tempFilePath = null;

        return null;
    } catch (error) {
        console.error(
            'Erro no comando X:',
            error
        );

        if (error.message === 'FILE_TOO_LARGE') {
            return '❌ O vídeo é maior que o limite permitido pelo bot.';
        }

        if (error.message === 'VIDEO_NOT_FOUND') {
            return (
                '❌ Não encontrei vídeo nessa publicação do X.\n\n' +
                'Confirme se o link possui um vídeo reproduzível.'
            );
        }

        if (
            /login|private|authenticate|forbidden|unauthorized/i.test(
                error.message || ''
            )
        ) {
            return (
                '❌ O X exigiu autenticação para acessar esse vídeo.\n\n' +
                'A publicação pode ser privada, restrita ou exigir login.'
            );
        }

        if (error.code === 'ECONNABORTED') {
            return '❌ O download demorou demais e foi cancelado.';
        }

        return '❌ Não consegui baixar o vídeo do X agora. Tente novamente.';
    } finally {
        if (tempFilePath) {
            await fs.promises.unlink(tempFilePath).catch(() => {});
        }
    }
};
