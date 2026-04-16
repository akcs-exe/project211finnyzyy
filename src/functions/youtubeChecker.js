const { EmbedBuilder } = require('discord.js');
const { setIntervalAsync } = require('set-interval-async');
const YoutubeNotif = require('../schemas/YoutubeNotif');
const { getLatestVideo, getVideoType, formatNotifMessage } = require('./youtubeUtils');

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

function startYoutubeChecker(client) {
    console.log('[YouTube] 🔴 Checker démarré (intervalle: 5 minutes)');

    setIntervalAsync(async () => {
        try {
            await checkAllChannels(client);
        } catch (err) {
            console.error('[YouTube] Erreur globale du checker:', err);
        }
    }, CHECK_INTERVAL_MS);

    setTimeout(() => checkAllChannels(client), 30_000);
}

async function checkAllChannels(client) {
    const configs = await YoutubeNotif.find({ enabled: true });
    if (!configs.length) return;

    console.log(`[YouTube] Vérification de ${configs.length} chaîne(s)...`);

    for (const config of configs) {
        try {
            const latest = await getLatestVideo(config.youtubeChannelId);
            if (!latest) continue;

            config.lastChecked = new Date();

            const videoType = await getVideoType(latest.videoId);

            if (videoType === 'upcoming') {
                await config.save();
                continue;
            }

            const isLive = videoType === 'live';

            if (isLive) {
                if (config.notifType === 'video') {
                    await config.save();
                    continue;
                }

                // Déjà notifié pour ce live
                if (config.lastLiveId === latest.videoId) {
                    await config.save();
                    continue;
                }

                config.lastLiveId = latest.videoId;
                await config.save();

                await sendNotification(client, config, latest, 'live');

            } else {
                if (config.notifType === 'live') {
                    await config.save();
                    continue;
                }

                if (config.lastVideoId === latest.videoId) {
                    await config.save();
                    continue;
                }

                const isFirstCheck = config.lastVideoId === null;
                config.lastVideoId = latest.videoId;
                await config.save();

                if (isFirstCheck) continue;

                await sendNotification(client, config, latest, 'video');
            }

        } catch (err) {
            console.error(`[YouTube] Erreur pour "${config.youtubeChannelName}":`, err.message);
        }
    }
}

async function sendNotification(client, config, video, type) {
    try {
        const guild = await client.guilds.fetch(config.guildId).catch(() => null);
        if (!guild) return;

        const channel = await guild.channels.fetch(config.channelId).catch(() => null);
        if (!channel || !channel.isTextBased()) return;

        const template = (type === 'live' && config.liveMessage)
            ? config.liveMessage
            : config.notifMessage;

        const textContent = formatNotifMessage(template, {
            channelName: config.youtubeChannelName,
            videoTitle: video.title,
            videoUrl: video.url,
            mention: config.mentionId,
        });

        const isLive = type === 'live';
        const embedColor = isLive ? 0xFF0000 : 0xFF0000;
        const titlePrefix = isLive ? '🔴' : '🎬';
        const footerText = isLive
            ? 'YouTube • Live en cours'
            : 'YouTube • Nouvelle vidéo';

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({
                name: config.youtubeChannelName,
                iconURL: config.youtubeChannelThumbnail || undefined,
                url: config.youtubeChannelUrl,
            })
            .setTitle(`${titlePrefix} ${video.title}`)
            .setURL(video.url)
            .setImage(video.thumbnail)
            .setFooter({ text: footerText })
            .setTimestamp(video.publishedAt);

        await channel.send({ content: textContent, embeds: [embed] });

        const label = isLive ? 'LIVE' : 'vidéo';
        console.log(`[YouTube] ✅ Notif ${label} envoyée pour "${config.youtubeChannelName}" dans #${channel.name}`);
    } catch (err) {
        console.error(`[YouTube] Erreur envoi notif:`, err.message);
    }
}

module.exports = { startYoutubeChecker };