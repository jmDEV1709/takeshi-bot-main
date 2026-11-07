const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { pipeline } = require('stream/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { tiktokdl } = require('@bochilteam/scraper-tiktok');
const { instagramdl } = require('@bochilteam/scraper-instagram');

const DOWNLOAD_TIMEOUT = 120000;
const TEMP_MEDIA_DIR = path.join(__dirname, '..', 'media', 'temp');
const execFileAsync = promisify(execFile);

// Impede vários downloads simultâneos no mesmo grupo
const activeDownloads = new Set();

function getYtDlpBinary() {
    if (process.env.YTDLP_PATH) {
        return process.env.YTDLP_PATH;
    }

    const localBinary = path.resolve(process.cwd(), '.bin', 'yt-dlp');
    return fs.existsSync(localBinary) ? localBinary : 'yt-dlp';
}

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

    await pipeline(
        response.data,
        fs.createWriteStream(outputPath)
    );
}

async function downloadWithYtDlp(url) {
    await ensureTempDir();

    const outputPath = path.join(
        TEMP_MEDIA_DIR,
        `social-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`
    );

    try {
        await execFileAsync(
            getYtDlpBinary(),
            [
                '--no-playlist',
                '--no-warnings',
                '--no-progress',
                '-f',
                'best[ext=mp4]/best',
                '-o',
                outputPath,
                url
            ],
            {
                timeout: DOWNLOAD_TIMEOUT,
                maxBuffer: 1024 * 1024
            }
        );

        return await fs.promises.readFile(outputPath);
    } finally {
        await fs.promises.unlink(outputPath).catch(() => {});
    }
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

        try {
            await downloadVideoToFile(downloadUrl, temporaryFilePath);
        } catch (error) {
            console.warn(
                `Download direto do ${platformName} falhou; tentando yt-dlp:`,
                error.message
            );
            const videoBuffer = await downloadWithYtDlp(validUrl);
            await fs.promises.writeFile(temporaryFilePath, videoBuffer);
        }

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
