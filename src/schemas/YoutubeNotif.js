const { Schema, model, models } = require('mongoose');

const YoutubeNotifSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    youtubeChannelId: {
        type: String,
        required: true,
    },
    youtubeChannelName: {
        type: String,
        required: true,
    },
    youtubeChannelUrl: {
        type: String,
        required: true,
    },
    youtubeChannelThumbnail: {
        type: String,
        default: null,
    },

    notifType: {
        type: String,
        enum: ['video', 'live', 'both'],
        default: 'both',
    },

    notifMessage: {
        type: String,
        default: '🎬 **{channelName}** vient de publier une vidéo !\n\n**{videoTitle}**\n{videoUrl}',
    },

    liveMessage: {
        type: String,
        default: '🔴 **{channelName}** est en LIVE !\n\n**{videoTitle}**\n🎙️ {videoUrl}',
    },

    mentionId: {
        type: String,
        default: null,
    },

    lastVideoId: {
        type: String,
        default: null,
    },

    lastLiveId: {
        type: String,
        default: null,
    },

    lastChecked: {
        type: Date,
        default: Date.now,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
    addedBy: {
        type: String,
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

YoutubeNotifSchema.index({ guildId: 1, youtubeChannelId: 1 }, { unique: true });

module.exports = models.YoutubeNotif || model('YoutubeNotif', YoutubeNotifSchema);