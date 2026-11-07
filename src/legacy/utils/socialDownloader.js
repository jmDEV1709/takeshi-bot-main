const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');
const { tiktokdl } = require('@bochilteam/scraper-tiktok');
const { instagramdl } = require('@bochilteam/scraper-instagram');

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 120000;
const TEMP_MEDIA_DIR = path.join(__dirname, '..', 'media', 'temp');

// Impede vários downloads simultâneos no mesmo grupo
const activeDownloads = new Set();

function isAllowedDomain(hostname, platform) {
    const host = hostname
        .toLowerCase()
        .replace(/^www\./, '');

    if (platform === 'instagram') {
        return (
            host === 'instagram.com' ||
            host.endsWith('.instagram.com')
        );
    }

    if (platform === 'tiktok') {
        return (
            host === 'tiktok.com' ||
            host.endsWith('.tiktok.com')
        );
    }

    return false;
}

function validateUrl(rawUrl, platform) {
    let parsedUrl;

    try {
        parsedUrl = new URL(rawUrl);
    } catch {
        throw new Error('INVALID_URL');
    }

    if (
        parsedUrl.protocol !== 'https:' &&
        parsedUrl.protocol !== 'http:'
    ) {
        throw new Error('INVALID_URL');
    }

    if (!isAllowedDomain(parsedUrl.hostname, platform)) {
        throw new Error('WRONG_PLATFORM');
    }

    return parsedUrl.toString();
}

async function resolveDownloadUrl(url, platform) {
    if (platform === 'instagram') {
        const results = await instagramdl(url);
        const video = results.find((item) => item.type === 'video');

        if (!video?.url) {
            throw new Error('VIDEO_NOT_FOUND');
        }

        return video.url;
    }

    if (platform === 'tiktok') {
        const data = await tiktokdl(url);
        const videoUrl =
            data?.video?.noWatermark ||
            data?.video?.withWatermark;

        if (!videoUrl) {
            throw new Error('VIDEO_NOT_FOUND');
        }

        return videoUrl;
    }

    throw new Error('UNSUPPORTED_PLATFORM');
}

async function ensureTempDir() {
    await fs.promises.mkdir(TEMP_MEDIA_DIR, { recursive: true });
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

    if (contentLength && contentLength > MAX_FILE_SIZE) {
        throw new Error('FILE_TOO_LARGE');
    }

    let downloadedBytes = 0;

    response.data.on('data', (chunk) => {
        downloadedBytes += chunk.length;

        if (downloadedBytes > MAX_FILE_SIZE) {
            response.data.destroy(new Error('FILE_TOO_LARGE'));
        }
    });

    await pipeline(
        response.data,
        fs.createWriteStream(outputPath)
    );
}

function friendlyError(error, platformName) {
    if (error?.message === 'INVALID_URL') {
        return '❌ O link enviado não é válido.';
    }

    if (error?.message === 'WRONG_PLATFORM') {
        return `❌ Esse link não pertence ao ${platformName}.`;
    }

    if (error?.message === 'VIDEO_NOT_FOUND') {
        return (
            `❌ Não encontrei vídeo disponível no ${platformName}.`
        );
    }

    if (error?.message === 'FILE_TOO_LARGE') {
        return '❌ O vídeo ultrapassa o limite de 50 MB.';
    }

    if (error?.code === 'ECONNABORTED') {
        return '❌ O download demorou demais e foi cancelado.';
    }

    return (
        `❌ Não consegui baixar o vídeo do ${platformName}. ` +
        'Tente novamente em instantes.'
    );
}

async function downloadSocialVideo({
    url,
    platform,
    platformName,
    message,
    sock
}) {
    const remoteJid = message.key.remoteJid;

    if (activeDownloads.has(remoteJid)) {
        return (
            '⚠️ Já existe um download em andamento neste grupo. ' +
            'Aguarde ele terminar.'
        );
    }

    let temporaryFilePath;

    try {
        const validUrl = validateUrl(
            url,
            platform
        );

        activeDownloads.add(remoteJid);

        await sock.sendMessage(
            remoteJid,
            {
                text:
                    `⏳ Baixando vídeo do ${platformName}...`
            },
            {
                quoted: message
            }
        );

        await ensureTempDir();

        temporaryFilePath = path.join(
            TEMP_MEDIA_DIR,
            `${platform}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`
        );

        const downloadUrl = await resolveDownloadUrl(
            validUrl,
            platform
        );

        await downloadVideoToFile(
            downloadUrl,
            temporaryFilePath
        );

        await sock.sendMessage(
            remoteJid,
            {
                video: { url: temporaryFilePath },
                mimetype: 'video/mp4',
                caption:
                    `✅ Vídeo baixado do ${platformName}`
            },
            {
                quoted: message
            }
        );

        await fs.promises.unlink(temporaryFilePath);
        temporaryFilePath = null;

        return null;
    } catch (error) {
        console.error(
            `Erro no download do ${platformName}:`,
            error
        );

        return friendlyError(
            error,
            platformName
        );
    } finally {
        activeDownloads.delete(remoteJid);

        if (temporaryFilePath) {
            await fs.promises.unlink(temporaryFilePath).catch(() => {});
        }
    }
}

module.exports = {
    downloadSocialVideo
};
