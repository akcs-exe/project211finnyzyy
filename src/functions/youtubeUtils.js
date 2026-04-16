const axios = require('axios');

async function resolveYoutubeChannel(input) {
    let channelId = null;
    let channelUrl = null;

    const channelMatch = input.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    if (channelMatch) {
        channelId = channelMatch[1];
    }

    if (!channelId) {
        const handleMatch = input.match(/(?:youtube\.com\/|@)([\w.-]+)/);
        if (handleMatch) {
            const handle = handleMatch[1].replace('@', '');
            try {
                const res = await axios.get(`https://www.youtube.com/@${handle}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'fr-FR,fr;q=0.9'
                    },
                    timeout: 8000
                });

                const idMatch = res.data.match(/"channelId":"(UC[\w-]{22})"/);
                if (idMatch) {
                    channelId = idMatch[1];
                } else {
                    const metaMatch = res.data.match(/meta itemprop="channelId" content="(UC[\w-]{22})"/);
                    if (metaMatch) channelId = metaMatch[1];
                }
            } catch (e) {
                throw new Error(`Impossible de trouver "@${handle}". Vérifie l'orthographe.`);
            }
        }
    }

    if (!channelId && /^UC[\w-]{22}$/.test(input.trim())) {
        channelId = input.trim();
    }

    if (!channelId) {
        throw new Error('Format invalide. Utilise une URL YouTube valide (ex: https://youtube.com/@nomchaîne)');
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    let rssData;
    try {
        const rssRes = await axios.get(rssUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
            timeout: 8000
        });
        rssData = rssRes.data;
    } catch (e) {
        throw new Error(`Impossible d'accéder au flux RSS (ID: ${channelId}). La chaîne existe-t-elle ?`);
    }

    const titleMatch = rssData.match(/<title>([^<]+)<\/title>/);
    const channelName = titleMatch ? titleMatch[1].trim() : 'Chaîne inconnue';

    let thumbnail = null;
    try {
        const pageRes = await axios.get(`https://www.youtube.com/channel/${channelId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
            timeout: 8000
        });
        const thumbMatch = pageRes.data.match(/"avatar":.*?"url":"(https:\/\/yt3\.ggpht[^"]+)"/);
        if (thumbMatch) thumbnail = thumbMatch[1].split('=')[0] + '=s256-c-k-c0x00ffffff-no-rj';
    } catch (e) {}

    channelUrl = `https://www.youtube.com/channel/${channelId}`;

    return { channelId, channelName, channelUrl, thumbnail };
}

async function getLatestVideo(channelId) {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const res = await axios.get(rssUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
            timeout: 8000
        });
        const xml = res.data;

        const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g);
        if (!entries || entries.length === 0) return null;

        const latest = entries[0];

        const videoIdMatch = latest.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = latest.match(/<title>([^<]+)<\/title>/);
        const publishedMatch = latest.match(/<published>([^<]+)<\/published>/);

        if (!videoIdMatch) return null;

        const videoId = videoIdMatch[1];
        const title = titleMatch ? titleMatch[1].trim() : 'Sans titre';
        const publishedAt = publishedMatch ? new Date(publishedMatch[1]) : new Date();
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        return { videoId, title, url, publishedAt, thumbnail };
    } catch (e) {
        return null;
    }
}

async function getVideoType(videoId) {
    try {
        const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'fr-FR,fr;q=0.9'
            },
            timeout: 8000
        });
        const html = res.data;

        if (
            html.includes('"isLive":true') ||
            html.includes('"isLive": true') ||
            html.includes('"liveBroadcastContent":"live"')
        ) {
            return 'live';
        }

        if (
            html.includes('"liveBroadcastContent":"upcoming"') ||
            html.includes('"isUpcoming":true')
        ) {
            return 'upcoming';
        }

        return 'video';
    } catch (e) {
        return 'video';
    }
}

function formatNotifMessage(template, { channelName, videoTitle, videoUrl, mention }) {
    let msg = template
        .replace(/{channelName}/g, channelName)
        .replace(/{videoTitle}/g, videoTitle)
        .replace(/{videoUrl}/g, videoUrl);

    if (mention) {
        if (mention === 'everyone') {
            msg = `@everyone\n${msg}`;
        } else {
            msg = `<@&${mention}>\n${msg}`;
        }
    }
    return msg;
}

module.exports = { resolveYoutubeChannel, getLatestVideo, getVideoType, formatNotifMessage };