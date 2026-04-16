const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { generateRankCard } = require('../../functions/rankCard');
const { levelProgress } = require('../../functions/xpUtils');
const Level = require('../../schemas/Level');
const LevelConfig = require('../../schemas/LevelConfig');

module.exports = {
    disabled: false,
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('📊 Affiche ta carte de rang')
        .addUserOption(opt => opt
            .setName('user')
            .setDescription('Utilisateur à consulter (toi par défaut)')
            .setRequired(false)),

    async execute(interaction, client) {
        await interaction.deferReply();

        const target = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guildId;

        let userData = await Level.findOne({ userId: target.id, guildId });
        if (!userData) userData = { xp: 0, level: 0, totalMessages: 0 };

        let config = await LevelConfig.findOne({ guildId });
        if (!config) config = {};

        const rank = await Level.countDocuments({ guildId, xp: { $gt: userData.xp } }) + 1;
        const totalUsers = await Level.countDocuments({ guildId });

        const { level, currentXp, needed } = levelProgress(userData.xp);

        const avatarUrl = target.displayAvatarURL({ extension: 'png', size: 256, forceStatic: true });

        let roleColor = null;
        let roleLabel = null;

        if (config.cardColorFromRole !== false && config.levelRoles?.length) {
            let member = null;
            try {
                member = await interaction.guild.members.fetch(target.id);
            } catch {}

            const sortedRoles = [...config.levelRoles].sort((a, b) => b.level - a.level);

            for (const lr of sortedRoles) {
                if (level >= lr.level) {
                    const discordRole = interaction.guild.roles.cache.get(lr.roleId);
                    if (!discordRole) continue;

                    if (lr.cardColor) {
                        roleColor = lr.cardColor;
                        roleLabel = lr.cardLabel || discordRole.name;
                    } else if (discordRole.color !== 0) {
                        roleColor = '#' + discordRole.color.toString(16).padStart(6, '0');
                        roleLabel = lr.cardLabel || discordRole.name;
                    }

                    if (roleColor) break; 
                }
            }
        }

        const buffer = await generateRankCard({
            username: target.username,
            avatarUrl,
            level,
            currentXp,
            neededXp: needed,
            totalXp: userData.xp,
            rank,
            totalUsers: Math.max(totalUsers, 1),
            totalMessages: userData.totalMessages || 0,
            cardTheme: config.cardTheme || null,
            cardAccentColor: config.cardAccentColor || null,
            backgroundUrl: config.cardBackground || null,
            cardColorFromRole: config.cardColorFromRole !== false,
            roleColor,
            roleLabel,
        });

        const attachment = new AttachmentBuilder(buffer, { name: 'rank.png' });
        await interaction.editReply({ files: [attachment] });
    }
};
