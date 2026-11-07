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
            ',insta https://www.instagram.com/reel/...'
        );
    }

    return downloadSocialVideo({
        url,
        platform: 'instagram',
        platformName: 'Instagram',
        message,
        sock
    });
};