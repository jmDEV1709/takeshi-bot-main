const {
    downloadSocialVideo
} = require('../utils/socialDownloader');

module.exports = async ({
    args,
    message,
    sock
}) => {
    const url = args[0];

    if (!url) {
        return (
            '❌ Digite o comando junto com o link.\n\n' +
            'Exemplo:\n' +
            ',tk https://www.tiktok.com/@usuario/video/...'
        );
    }

    return downloadSocialVideo({
        url,
        platform: 'tiktok',
        platformName: 'TikTok',
        message,
        sock
    });
};
