const Level = require('../schemas/Level');
const LevelConfig = require('../schemas/LevelConfig');
const { levelFromXp } = require('../functions/xpUtils');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        let config = await LevelConfig.findOne({ guildId });
        if (!config) config = new LevelConfig({ guildId });
        if (!config.enabled) return;

        if (config.ignoredChannels.includes(message.channel.id)) return;
        if (message.member?.roles?.cache?.some(r => config.ignoredRoles.includes(r.id))) return;

        let userData = await Level.findOne({ userId, guildId });
        if (!userData) userData = new Level({ userId, guildId });

        const now = Date.now();
        const cooldownMs = (config.xpCooldown || 60) * 1000;
        if (now - userData.lastMessageTimestamp < cooldownMs) return;

        const variance = config.xpVariance || 5;
        const xpGain = (config.xpPerMessage || 15) + Math.floor(Math.random() * variance * 2) - variance;
        const gainedXp = Math.max(1, xpGain);

        const oldLevel = levelFromXp(userData.xp).level;
        userData.xp += gainedXp;
        userData.totalMessages = (userData.totalMessages || 0) + 1;
        userData.lastMessageTimestamp = now;

        const newLevelData = levelFromXp(userData.xp);
        userData.level = newLevelData.level;

        await userData.save();

        if (newLevelData.level > oldLevel) {
            await handleLevelUp(message, client, userData, newLevelData.level, config);
        }
    }
};

async function handleLevelUp(message, client, userData, newLevel, config) {
    if (config.levelUpEnabled !== false) {
        const levelMsg = (config.levelUpMessage || '🎉 GG {user} ! Tu passes au niveau **{level}** !')
            .replace(/{user}/g, `<@${userData.userId}>`)
            .replace(/{level}/g, String(newLevel));

        let channel = message.channel;
        if (config.levelUpChannel) {
            const ch = message.guild.channels.cache.get(config.levelUpChannel);
            if (ch) channel = ch;
        }

        await channel.send(levelMsg).catch(() => {});
    }

    if (!config.levelRoles?.length) return;
    const member = message.member;
    if (!member) return;

    const sorted = [...config.levelRoles].sort((a, b) => a.level - b.level);

    for (const reward of sorted) {
        const role = message.guild.roles.cache.get(reward.roleId);
        if (!role) continue;

        if (reward.level === newLevel) {
            await member.roles.add(role).catch(() => {});
        }

        if (reward.remove && reward.level < newLevel && member.roles.cache.has(role.id)) {
            await member.roles.remove(role).catch(() => {});
        }
    }
}
