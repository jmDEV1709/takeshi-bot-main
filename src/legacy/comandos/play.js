const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const TEMP_MEDIA_DIR = path.join(__dirname, '..', 'media', 'temp');
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
const MAX_DURATION_SECONDS = 30 * 60;
const execFileAsync = promisify(execFile);

function isUrl(str) {
    return /^https?:\/\//i.test(str);
}

async function resolveYouTubeUrl(query) {
    if (isUrl(query)) {
        return query;
    }

    return `ytsearch1:${query}`;
}

function getYtDlpBinary() {
    if (process.env.YTDLP_PATH) {
        return process.env.YTDLP_PATH;
    }

    const localBinary = path.resolve(process.cwd(), '.bin', 'yt-dlp');
    return fs.existsSync(localBinary) ? localBinary : 'yt-dlp';
}

async function ensureTempDir() {
    await fs.promises.mkdir(TEMP_MEDIA_DIR, { recursive: true });
}

function findCookiesFile() {
    const candidates = [
        process.env.YTDLP_COOKIES_FILE,
        path.resolve(process.cwd(), 'cookies', 'cookies.txt'),
        path.resolve(process.cwd(), 'cookies.txt'),
        '/app/cookies/cookies.txt'
    ].filter(Boolean);

    return candidates.find((candidate) => {
        try {
            return fs.statSync(candidate).isFile() && fs.statSync(candidate).size > 0;
        } catch {
            return false;
        }
    });
}

async function downloadYouTubeAudio(url) {
    await ensureTempDir();

    const outputDir = await fs.promises.mkdtemp(
        path.join(TEMP_MEDIA_DIR, 'play-')
    );
    const outputTemplate = path.join(outputDir, '%(id)s.%(ext)s');
    const args = [
        '--no-playlist',
        '--no-warnings',
        '--no-progress',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--max-filesize', `${MAX_AUDIO_SIZE}`,
        '--match-filter', `duration <= ${MAX_DURATION_SECONDS}`,
        '--output', outputTemplate,
        url
    ];
    const cookiesFile = findCookiesFile();

    if (cookiesFile) {
        args.unshift('--cookies', cookiesFile);
    }

    try {
        await execFileAsync(getYtDlpBinary(), args, {
            maxBuffer: 1024 * 1024
        });

        const files = (await fs.promises.readdir(outputDir))
            .filter((file) => file.endsWith('.mp3'));

        if (!files.length) {
            throw new Error('AUDIO_NOT_FOUND');
        }

        return {
            outputPath: path.join(outputDir, files[0]),
            outputDir
        };
    } catch (error) {
        const details = `${error.message || ''}\n${error.stderr || ''}`;

        if (/duration|max-filesize|file is larger/i.test(details)) {
            throw new Error(/duration/i.test(details)
                ? 'DURATION_TOO_LONG'
                : 'FILE_TOO_LARGE');
        }
        if (/no results|video unavailable/i.test(details)) {
            throw new Error('SEARCH_NO_RESULTS');
        }
        if (/sign in|not a bot|confirm you.re not a bot|login required|authentication|po token/i.test(details)) {
            throw new Error('YOUTUBE_AUTH_REQUIRED');
        }
        if (/requested format|audio format|no video formats/i.test(details)) {
            throw new Error('AUDIO_FORMAT_NOT_FOUND');
        }
        if (error.code === 'ENOENT') {
            throw new Error('YTDLP_NOT_FOUND');
        }

        throw error;
    }
}

module.exports = async function play({ args, sock, message }) {
    const remoteJid = message.key.remoteJid;
    const query = args.join(' ').trim();

    if (!query) {
        return '❗ Uso: ,play <nome da música ou link do YouTube>';
    }

    let download;

    try {
        await sock.sendMessage(
            remoteJid,
            {
                text: '🔎 Buscando e baixando o áudio, aguenta aí...'
            },
            { quoted: message }
        );

        const youtubeUrl = await resolveYouTubeUrl(query);

        download = await downloadYouTubeAudio(youtubeUrl);

        await sock.sendMessage(
            remoteJid,
            {
                audio: { url: download.outputPath },
                mimetype: 'audio/mpeg',
                ptt: false
            },
            { quoted: message }
        );

        return null;
    } catch (error) {
        console.error('Erro no comando play:', error);

        if (error.message === 'SEARCH_NO_RESULTS') {
            return '❌ Não encontrei resultados para essa busca no YouTube.';
        }

        if (error.message === 'FILE_TOO_LARGE') {
            return '❌ O áudio ultrapassa o limite de 25 MB do bot.';
        }

        if (error.message === 'DURATION_TOO_LONG') {
            return '❌ O vídeo ultrapassa o limite máximo de 30 minutos.';
        }

        if (error.message === 'AUDIO_FORMAT_NOT_FOUND') {
            return '❌ Não encontrei um formato de áudio compatível para esse vídeo.';
        }
        if (error.message === 'YOUTUBE_AUTH_REQUIRED') {
            return '❌ O YouTube bloqueou este download. Tente outro vídeo público ou configure cookies em cookies/cookies.txt.';
        }
        if (error.message === 'YTDLP_NOT_FOUND') {
            return '❌ O componente de download não está instalado no servidor. Reinstale o bot pelo egg atualizado.';
        }

        return '❌ Não consegui baixar o áudio agora. Tente outro link ou outra música.';
    } finally {
        if (download?.outputDir) {
            await fs.promises.rm(download.outputDir, {
                recursive: true,
                force: true
            });
        }
    }
};
