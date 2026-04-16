const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
} = require('discord.js');

const LevelConfig = require('../../schemas/LevelConfig');
const Level = require('../../schemas/Level');
const { totalXpForLevel, levelFromXp } = require('../../functions/xpUtils');

const C = {
    BRAND:   0x5865F2,
    SUCCESS: 0x00e676,
    ERROR:   0xff1744,
    WARN:    0xffa726,
    OFF:     0x4f545c,
    GOLD:    0xf1c40f,
    PURPLE:  0x9b59b6,
};

const TIMEOUT = 5 * 60 * 1000;
const sep = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';

function mainPanelEmbed(config, guild) {
    const on  = '`🟢 Activé `';
    const off = '`🔴 Désactivé`';

    const xpMsgShort = (config.levelUpMessage || '').length > 60
        ? (config.levelUpMessage || '').slice(0, 57) + '...'
        : (config.levelUpMessage || '> *Non défini*');

    const levelRoles = config.levelRoles?.length
        ? [...config.levelRoles].sort((a, b) => a.level - b.level)
            .map(r => {
                const colorTag = r.cardColor ? ` \`${r.cardColor}\`` : '';
                const labelTag = r.cardLabel ? ` *"${r.cardLabel}"*` : '';
                return `> **Niv. ${r.level}** → <@&${r.roleId}>${colorTag}${labelTag}${r.remove ? ' *(retiré ensuite)*' : ''}`;
            })
            .join('\n')
        : '> *Aucune récompense configurée*';

    const ignored = [
        ...(config.ignoredChannels || []).map(c => `<#${c}>`),
        ...(config.ignoredRoles    || []).map(r => `<@&${r}>`),
    ].join('  ') || '> *Aucun*';

    const cardLines = [
        `${config.cardColorFromRole !== false ? on : off} Couleur auto depuis le rôle`,
        config.cardAccentColor ? `> Couleur fixe : \`${config.cardAccentColor}\`` : '',
        config.cardTheme       ? `> Thème fixe : \`${config.cardTheme}\`` : '',
        config.cardBackground  ? `> Fond custom : *défini*` : '',
    ].filter(Boolean).join('\n') || '> *Style auto selon le niveau*';

    return new EmbedBuilder()
        .setColor(config.enabled ? C.BRAND : C.OFF)
        .setAuthor({
            name: 'Panel Admin — Système de Niveaux',
            iconURL: guild.iconURL({ dynamic: true }) || undefined,
        })
        .setDescription(`${sep}\n** **`)
        .addFields(
            {
                name: '⚡  Système XP',
                value: [
                    `${config.enabled ? on : off}  Gain XP actif`,
                    `> **${config.xpPerMessage ?? 15}** XP/msg  ±**${config.xpVariance ?? 5}**  —  cooldown **${config.xpCooldown ?? 60}s**`,
                ].join('\n'),
                inline: false,
            },
            {
                name: '🎉  Message de Level-Up',
                value: [
                    `${config.levelUpEnabled !== false ? on : off}  Notifications`,
                    config.levelUpChannel ? `> Salon : <#${config.levelUpChannel}>` : '> Salon : `même salon`',
                    `> Message : ${xpMsgShort}`,
                ].join('\n'),
                inline: false,
            },
            {
                name: '🎭  Récompenses de rôles',
                value: levelRoles,
                inline: false,
            },
            {
                name: '🎨  Style des cartes',
                value: cardLines,
                inline: false,
            },
            {
                name: '🚫  Ignorés',
                value: ignored,
                inline: false,
            },
            { name: '** **', value: sep, inline: false },
        )
        .setFooter({ text: `${guild.name}  •  Boutons ci-dessous pour configurer` })
        .setTimestamp();
}

function buildMainRows(config) {
    const toggleLabel = config.enabled ? '🔴 Désactiver XP' : '🟢 Activer XP';
    const toggleStyle = config.enabled ? ButtonStyle.Danger : ButtonStyle.Success;

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ls_toggle_xp').setLabel(toggleLabel).setStyle(toggleStyle),
        new ButtonBuilder().setCustomId('ls_xp_params').setLabel('⚙️ Paramètres XP').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ls_levelup').setLabel('🎉 Level-Up').setStyle(ButtonStyle.Primary),
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ls_roles').setLabel('🎭 Rôles').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ls_card_style').setLabel('🎨 Style carte').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ls_ignore').setLabel('🚫 Ignorer').setStyle(ButtonStyle.Secondary),
    );
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ls_give_level').setLabel('🎁 Give Level').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ls_reset_config').setLabel('♻️ Reset config').setStyle(ButtonStyle.Danger),
    );
    return [row1, row2, row3];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelsetup')
        .setDescription('🛠️ Ouvre le panel de configuration du système de niveaux')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        let config = await LevelConfig.findOne({ guildId: interaction.guildId });
        if (!config) config = new LevelConfig({ guildId: interaction.guildId });

        const msg = await interaction.editReply({
            embeds: [mainPanelEmbed(config, interaction.guild)],
            components: buildMainRows(config),
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: TIMEOUT,
        });

        collector.on('collect', async (i) => {
            try {
                config = await LevelConfig.findOne({ guildId: interaction.guildId }) || config;

                if (i.customId === 'ls_toggle_xp') {
                    config.enabled = !config.enabled;
                    await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

                if (i.customId === 'ls_xp_params') {
                    const modal = new ModalBuilder().setCustomId('ls_modal_xp').setTitle('⚙️ Paramètres XP');
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('xp_pm').setLabel('XP par message').setStyle(TextInputStyle.Short).setValue(String(config.xpPerMessage ?? 15)).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('xp_var').setLabel('Variance (±)').setStyle(TextInputStyle.Short).setValue(String(config.xpVariance ?? 5)).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('xp_cd').setLabel('Cooldown (secondes)').setStyle(TextInputStyle.Short).setValue(String(config.xpCooldown ?? 60)).setRequired(true)),
                    );
                    await i.showModal(modal);
                    const sub = await i.awaitModalSubmit({ filter: m => m.customId === 'ls_modal_xp' && m.user.id === interaction.user.id, time: 60000 }).catch(() => null);
                    if (!sub) return;
                    const xpm = parseInt(sub.fields.getTextInputValue('xp_pm'));
                    const xpv = parseInt(sub.fields.getTextInputValue('xp_var'));
                    const xpc = parseInt(sub.fields.getTextInputValue('xp_cd'));
                    if ([xpm, xpv, xpc].some(isNaN)) return sub.reply({ content: '❌ Valeurs numériques uniquement.', ephemeral: true });
                    config.xpPerMessage = xpm; config.xpVariance = xpv; config.xpCooldown = xpc;
                    await config.save();
                    await sub.deferUpdate();
                    return interaction.editReply({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

                if (i.customId === 'ls_levelup') {
                    const toggleLU = config.levelUpEnabled !== false
                        ? new ButtonBuilder().setCustomId('ls_lu_disable').setLabel('🔴 Désactiver').setStyle(ButtonStyle.Danger)
                        : new ButtonBuilder().setCustomId('ls_lu_enable').setLabel('🟢 Activer').setStyle(ButtonStyle.Success);
                    return i.update({
                        embeds: [new EmbedBuilder().setColor(C.BRAND).setTitle('🎉 Level-Up')
                            .setDescription('Variables disponibles : `{user}` `{level}`\n\nConfigurer les notifications de passage de niveau.')],
                        components: [
                            new ActionRowBuilder().addComponents(
                                toggleLU,
                                new ButtonBuilder().setCustomId('ls_lu_edit').setLabel('✏️ Message').setStyle(ButtonStyle.Primary),
                                new ButtonBuilder().setCustomId('ls_lu_channel').setLabel('📢 Salon').setStyle(ButtonStyle.Secondary),
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary),
                            ),
                        ],
                    });
                }
                if (i.customId === 'ls_lu_enable' || i.customId === 'ls_lu_disable') {
                    config.levelUpEnabled = !config.levelUpEnabled; await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }
                if (i.customId === 'ls_lu_edit') {
                    const modal = new ModalBuilder().setCustomId('ls_modal_lu_msg').setTitle('Message de Level-Up');
                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder().setCustomId('lu_msg').setLabel('Message').setStyle(TextInputStyle.Paragraph)
                            .setValue(config.levelUpMessage || '🎉 Bravo {user} ! Tu passes au niveau **{level}** ! 🚀')
                            .setMaxLength(500).setRequired(true)
                    ));
                    await i.showModal(modal);
                    const sub = await i.awaitModalSubmit({ filter: m => m.customId === 'ls_modal_lu_msg' && m.user.id === interaction.user.id, time: 60000 }).catch(() => null);
                    if (!sub) return;
                    config.levelUpMessage = sub.fields.getTextInputValue('lu_msg');
                    await config.save();
                    await sub.deferUpdate();
                    return interaction.editReply({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }
                if (i.customId === 'ls_lu_channel') {
                    const select = new ChannelSelectMenuBuilder().setCustomId('ls_lu_chan_select').setChannelTypes([0]).setPlaceholder('Choisir un salon (vide = même salon)');
                    await i.update({ embeds: [new EmbedBuilder().setColor(C.BRAND).setTitle('📢 Salon Level-Up').setDescription('Choisissez le salon pour les annonces.\nLaissez vide et appuyez ↩ pour remettre dans le salon du message.')], components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_lu_chan_reset').setLabel('🗑️ Réinitialiser').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary))] });
                }
                if (i.customId === 'ls_lu_chan_select') {
                    config.levelUpChannel = i.values[0]; await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }
                if (i.customId === 'ls_lu_chan_reset') {
                    config.levelUpChannel = null; await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

                if (i.customId === 'ls_roles') return showRolesPanel(i, config, interaction);
                if (i.customId === 'ls_roles_add') return handleRoleAdd(i, config, interaction);
                if (i.customId === 'ls_roles_remove') return handleRoleRemove(i, config, interaction);

                if (i.customId === 'ls_card_style') return showCardStylePanel(i, config, interaction);
                if (i.customId === 'ls_card_toggle_role') {
                    config.cardColorFromRole = config.cardColorFromRole === false ? true : false;
                    await config.save();
                    return showCardStylePanel(i, config, interaction);
                }
                if (i.customId === 'ls_card_accent') return handleCardAccent(i, config, interaction);
                if (i.customId === 'ls_card_bg') return handleCardBg(i, config, interaction);
                if (i.customId === 'ls_card_reset') {
                    config.cardTheme = null; config.cardAccentColor = null;
                    config.cardBackground = null; config.cardColorFromRole = true;
                    await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

                if (i.customId === 'ls_ignore') return showIgnorePanel(i, config, interaction);
                if (i.customId === 'ls_ignore_channel') return handleIgnoreChannel(i, config, interaction);
                if (i.customId === 'ls_ignore_role') return handleIgnoreRole(i, config, interaction);

                if (i.customId === 'ls_give_level') {
                    const userSelect = new UserSelectMenuBuilder().setCustomId('ls_give_user').setPlaceholder('Sélectionner le membre').setMaxValues(1);
                    return i.update({
                        embeds: [new EmbedBuilder().setColor(C.GOLD).setTitle('🎁 Give Level').setDescription('Sélectionnez le membre à qui vous souhaitez ajouter des niveaux.')],
                        components: [
                            new ActionRowBuilder().addComponents(userSelect),
                            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary)),
                        ],
                    });
                }
                if (i.customId === 'ls_give_user') {
                    const targetId = i.values[0];
                    const modal = new ModalBuilder().setCustomId(`ls_modal_give_${targetId}`).setTitle('Donner des niveaux');
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder().setCustomId('give_amount').setLabel('Niveaux à ajouter (ex: 5)')
                                .setStyle(TextInputStyle.Short).setPlaceholder('Entrez un nombre positif').setRequired(true)
                        )
                    );
                    await i.showModal(modal);
                    const sub = await i.awaitModalSubmit({
                        filter: m => m.customId.startsWith('ls_modal_give_') && m.user.id === interaction.user.id,
                        time: 60000
                    }).catch(() => null);
                    if (!sub) return;

                    const amount = parseInt(sub.fields.getTextInputValue('give_amount'));
                    if (isNaN(amount) || amount <= 0) {
                        return sub.reply({ content: '❌ Veuillez entrer un nombre positif.', ephemeral: true });
                    }

                    let userData = await Level.findOne({ guildId: interaction.guildId, userId: targetId });
                    if (!userData) userData = new Level({ guildId: interaction.guildId, userId: targetId, xp: 0, level: 0 });

                    const currentLevel = levelFromXp(userData.xp).level;
                    const newLevel = currentLevel + amount;
                    userData.xp = totalXpForLevel(newLevel);
                    userData.level = newLevel;
                    await userData.save();

                    try {
                        const member = await interaction.guild.members.fetch(targetId);
                        if (member && config.levelRoles?.length) {
                            const sorted = [...config.levelRoles].sort((a, b) => a.level - b.level);
                            for (const reward of sorted) {
                                const role = interaction.guild.roles.cache.get(reward.roleId);
                                if (!role) continue;
                                if (newLevel >= reward.level) {
                                    await member.roles.add(role).catch(() => {});
                                }
                                if (reward.remove && newLevel > reward.level && member.roles.cache.has(role.id)) {
                                    await member.roles.remove(role).catch(() => {});
                                }
                            }
                        }
                    } catch {}

                    await sub.deferUpdate();
                    await interaction.editReply({
                        embeds: [new EmbedBuilder().setColor(C.SUCCESS).setTitle('✅ Niveaux donnés')
                            .setDescription(`<@${targetId}> est maintenant **niveau ${newLevel}** (+${amount} niveaux).`)
                            .setFooter({ text: 'Panel Niveaux' })],
                        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary))],
                    });
                    return;
                }

                if (i.customId === 'ls_back' || i.customId === 'ls_reset_cancel') {
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

                if (i.customId === 'ls_reset_config') {
                    return i.update({
                        embeds: [new EmbedBuilder().setColor(C.ERROR).setTitle('♻️ Reset').setDescription('Remettre toute la config à zéro ?')],
                        components: [new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('ls_reset_confirm').setLabel('✅ Confirmer').setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('ls_reset_cancel').setLabel('↩ Annuler').setStyle(ButtonStyle.Secondary),
                        )],
                    });
                }
                if (i.customId === 'ls_reset_confirm') {
                    await LevelConfig.deleteOne({ guildId: interaction.guildId });
                    config = new LevelConfig({ guildId: interaction.guildId }); await config.save();
                    return i.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
                }

            } catch (err) {
                console.error('[levelsetup]', err);
                if (!i.replied && !i.deferred) await i.reply({ content: '❌ Erreur interne.', ephemeral: true }).catch(() => {});
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => {});
        });
    }
};

async function showRolesPanel(i, config, interaction) {
    const roles = config.levelRoles || [];
    const display = roles.length
        ? [...roles].sort((a, b) => a.level - b.level)
            .map(r => {
                const colorTag = r.cardColor ? ` \`${r.cardColor}\`` : '';
                const labelTag = r.cardLabel ? ` *"${r.cardLabel}"*` : '';
                return `> **Niv. ${r.level}** → <@&${r.roleId}>${colorTag}${labelTag}`;
            }).join('\n')
        : '> *Aucune récompense*';

    return i.update({
        embeds: [new EmbedBuilder().setColor(C.BRAND).setTitle('🎭 Récompenses de rôles')
            .setDescription(display)
            .addFields({ name: '💡 Info', value: 'Vous pouvez associer une **couleur** et un **label** à chaque rôle. La carte du membre prendra automatiquement ces paramètres.' })],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ls_roles_add').setLabel('➕ Ajouter').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ls_roles_remove').setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary),
            ),
        ],
    });
}

async function handleRoleAdd(i, config, interaction) {
    const modal = new ModalBuilder().setCustomId('ls_modal_roleadd').setTitle('Ajouter Rôle Reward');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('role_level').setLabel('Niveau requis').setStyle(TextInputStyle.Short).setPlaceholder('ex: 50').setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('role_color').setLabel('Couleur carte (#hex) — optionnel')
                .setStyle(TextInputStyle.Short).setPlaceholder('ex: #ff6d00 (laisser vide = couleur du rôle)').setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('role_label').setLabel('Label carte — optionnel')
                .setStyle(TextInputStyle.Short).setPlaceholder('ex: ÉLITE DRAGON (laisser vide = nom du rôle)').setRequired(false).setMaxLength(20)
        ),
    );
    await i.showModal(modal);

    const sub = await i.awaitModalSubmit({
        filter: m => m.customId === 'ls_modal_roleadd' && m.user.id === interaction.user.id,
        time: 60000
    }).catch(() => null);
    if (!sub) return;

    const lvl = parseInt(sub.fields.getTextInputValue('role_level'));
    if (isNaN(lvl) || lvl < 1) return sub.reply({ content: '❌ Niveau invalide.', ephemeral: true });

    const rawColor = sub.fields.getTextInputValue('role_color').trim();
    const rawLabel = sub.fields.getTextInputValue('role_label').trim();
    const cardColor = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : null;
    const cardLabel = rawLabel.length > 0 ? rawLabel.toUpperCase() : null;

    const roleSelect = new RoleSelectMenuBuilder().setCustomId('ls_role_pick').setPlaceholder('Choisir le rôle à associer');
    await sub.update({
        embeds: [new EmbedBuilder().setColor(C.BRAND).setTitle(`🎭 Rôle pour le niveau ${lvl}`)
            .setDescription(`Sélectionnez le rôle Discord à donner au niveau **${lvl}**.${cardColor ? `\n🎨 Couleur carte : \`${cardColor}\`` : '\n🎨 Couleur : automatique (couleur du rôle)'}${cardLabel ? `\n🏷️ Label : \`${cardLabel}\`` : ''}`)],
        components: [
            new ActionRowBuilder().addComponents(roleSelect),
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Annuler').setStyle(ButtonStyle.Secondary)),
        ],
    });

    const reply = await interaction.fetchReply();
    const roleInt = await reply.awaitMessageComponent({
        filter: r => r.customId === 'ls_role_pick' && r.user.id === interaction.user.id,
        time: 60000,
        componentType: ComponentType.RoleSelect,
    }).catch(() => null);

    if (!roleInt) return;

    const roleId = roleInt.values[0];
    if (!config.levelRoles) config.levelRoles = [];

    const existingIdx = config.levelRoles.findIndex(r => r.level === lvl);
    const entry = { level: lvl, roleId, remove: false, cardColor, cardLabel };
    if (existingIdx >= 0) config.levelRoles[existingIdx] = entry;
    else config.levelRoles.push(entry);

    config.markModified('levelRoles');
    await config.save();

    const addedRole = interaction.guild.roles.cache.get(roleId);
    return roleInt.update({
        embeds: [new EmbedBuilder().setColor(C.SUCCESS).setTitle('✅ Rôle ajouté')
            .setDescription(`**Niveau ${lvl}** → <@&${roleId}>` + (cardColor ? `\n🎨 Couleur carte : \`${cardColor}\`` : '\n🎨 Couleur : automatique') + (cardLabel ? `\n🏷️ Label : \`${cardLabel}\`` : `\n🏷️ Label : \`${addedRole?.name || roleId}\``))],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary))],
    });
}

async function handleRoleRemove(i, config, interaction) {
    if (!config.levelRoles?.length) return i.update({ embeds: [new EmbedBuilder().setColor(C.WARN).setTitle('Aucun rôle').setDescription('Aucune récompense à supprimer.')], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary))] });

    const options = [...config.levelRoles].sort((a, b) => a.level - b.level).map(r => ({
        label: `Niveau ${r.level}`,
        description: `Rôle: ${r.roleId}`,
        value: String(r.level),
        emoji: '🎭',
    }));
    const select = new StringSelectMenuBuilder().setCustomId('ls_role_remove_select').setPlaceholder('Choisir le niveau à supprimer').addOptions(options);
    await i.update({ embeds: [new EmbedBuilder().setColor(C.ERROR).setTitle('🗑️ Supprimer un rôle reward').setDescription('Sélectionnez le niveau à supprimer.')], components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Annuler').setStyle(ButtonStyle.Secondary))] });

    const reply = await interaction.fetchReply();
    const sel = await reply.awaitMessageComponent({
        filter: r => r.customId === 'ls_role_remove_select' && r.user.id === interaction.user.id,
        time: 60000, componentType: ComponentType.StringSelect
    }).catch(() => null);
    if (!sel) return;

    config.levelRoles = config.levelRoles.filter(r => String(r.level) !== sel.values[0]);
    config.markModified('levelRoles');
    await config.save();
    return sel.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
}

async function showCardStylePanel(i, config, interaction) {
    const roleColorActive = config.cardColorFromRole !== false;

    const lines = [
        `**Couleur auto depuis rôle :** ${roleColorActive ? '`🟢 Activé`' : '`🔴 Désactivé`'}`,
        roleColorActive
            ? '_La carte prend la couleur du rôle reward de plus haut niveau atteint._'
            : '_Les thèmes par défaut selon le niveau sont utilisés._',
        '',
        `**Couleur accent fixe :** ${config.cardAccentColor ? `\`${config.cardAccentColor}\`` : '*auto*'}`,
        `**Image de fond :** ${config.cardBackground ? '*définie*' : '*aucune*'}`,
    ].join('\n');

    return i.update({
        embeds: [new EmbedBuilder().setColor(C.PURPLE).setTitle('🎨 Style des cartes de rang')
            .setDescription(lines)
            .addFields({
                name: '💡 Priorité des styles',
                value: '1. 🎭 Couleur du rôle reward actif *(si activé)*\n2. 🎨 Couleur accent fixe globale\n3. 🖼️ Thème auto selon le niveau',
            })],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ls_card_toggle_role')
                    .setLabel(roleColorActive ? '🔴 Désactiver couleur rôle' : '🟢 Activer couleur rôle')
                    .setStyle(roleColorActive ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ls_card_accent').setLabel('🎨 Couleur fixe').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ls_card_bg').setLabel('🖼️ Fond custom').setStyle(ButtonStyle.Primary),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ls_card_reset').setLabel('🗑️ Réinitialiser style').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary),
            ),
        ],
    });
}

async function handleCardAccent(i, config, interaction) {
    const modal = new ModalBuilder().setCustomId('ls_modal_card_accent').setTitle('Couleur Accent Carte');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('accent_color').setLabel('Code hex (ex: #ff6d00) ou vide pour supprimer')
                .setStyle(TextInputStyle.Short).setPlaceholder('#ff6d00')
                .setValue(config.cardAccentColor || '').setRequired(false)
        )
    );
    await i.showModal(modal);
    const sub = await i.awaitModalSubmit({ filter: m => m.customId === 'ls_modal_card_accent' && m.user.id === interaction.user.id, time: 60000 }).catch(() => null);
    if (!sub) return;
    const raw = sub.fields.getTextInputValue('accent_color').trim();
    if (raw && !/^#[0-9a-fA-F]{6}$/.test(raw)) return sub.reply({ content: '❌ Format hex invalide. Exemple : `#ff6d00`', ephemeral: true });
    config.cardAccentColor = raw || null;
    await config.save();
    await sub.deferUpdate();
    return interaction.editReply({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
}

async function handleCardBg(i, config, interaction) {
    const modal = new ModalBuilder().setCustomId('ls_modal_card_bg').setTitle('Image de fond carte');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('bg_url').setLabel('URL de l\'image (vide = supprimer)')
                .setStyle(TextInputStyle.Short).setPlaceholder('https://...')
                .setValue(config.cardBackground || '').setRequired(false).setMaxLength(500)
        )
    );
    await i.showModal(modal);
    const sub = await i.awaitModalSubmit({ filter: m => m.customId === 'ls_modal_card_bg' && m.user.id === interaction.user.id, time: 60000 }).catch(() => null);
    if (!sub) return;
    config.cardBackground = sub.fields.getTextInputValue('bg_url').trim() || null;
    await config.save();
    await sub.deferUpdate();
    return interaction.editReply({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
}

async function showIgnorePanel(i, config, interaction) {
    const chans = (config.ignoredChannels || []).map(c => `<#${c}>`).join(' ') || '*Aucun*';
    const roles = (config.ignoredRoles || []).map(r => `<@&${r}>`).join(' ') || '*Aucun*';
    return i.update({
        embeds: [new EmbedBuilder().setColor(C.WARN).setTitle('🚫 Ignorer')
            .addFields({ name: 'Salons ignorés', value: chans, inline: true }, { name: 'Rôles ignorés', value: roles, inline: true })],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ls_ignore_channel').setLabel('📢 Salon').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ls_ignore_role').setLabel('🎭 Rôle').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ls_back').setLabel('↩ Retour').setStyle(ButtonStyle.Secondary),
            ),
        ],
    });
}

async function handleIgnoreChannel(i, config, interaction) {
    const select = new ChannelSelectMenuBuilder().setCustomId('ls_ignore_chan_select').setChannelTypes([0]).setPlaceholder('Salon à ignorer/dé-ignorer');
    await i.update({ embeds: [new EmbedBuilder().setColor(C.WARN).setTitle('📢 Ignorer un salon').setDescription('Sélectionnez un salon pour l\'ajouter ou le retirer de la liste des ignorés.')], components: [new ActionRowBuilder().addComponents(select)] });
    const reply = await interaction.fetchReply();
    const sel = await reply.awaitMessageComponent({ filter: r => r.customId === 'ls_ignore_chan_select' && r.user.id === interaction.user.id, time: 60000, componentType: ComponentType.ChannelSelect }).catch(() => null);
    if (!sel) return;
    const id = sel.values[0];
    if (!config.ignoredChannels) config.ignoredChannels = [];
    const idx = config.ignoredChannels.indexOf(id);
    if (idx >= 0) config.ignoredChannels.splice(idx, 1); else config.ignoredChannels.push(id);
    config.markModified('ignoredChannels'); await config.save();
    return sel.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
}

async function handleIgnoreRole(i, config, interaction) {
    const select = new RoleSelectMenuBuilder().setCustomId('ls_ignore_role_select').setPlaceholder('Rôle à ignorer/dé-ignorer');
    await i.update({ embeds: [new EmbedBuilder().setColor(C.WARN).setTitle('🎭 Ignorer un rôle').setDescription('Sélectionnez un rôle pour l\'ajouter ou le retirer.')], components: [new ActionRowBuilder().addComponents(select)] });
    const reply = await interaction.fetchReply();
    const sel = await reply.awaitMessageComponent({ filter: r => r.customId === 'ls_ignore_role_select' && r.user.id === interaction.user.id, time: 60000, componentType: ComponentType.RoleSelect }).catch(() => null);
    if (!sel) return;
    const id = sel.values[0];
    if (!config.ignoredRoles) config.ignoredRoles = [];
    const idx = config.ignoredRoles.indexOf(id);
    if (idx >= 0) config.ignoredRoles.splice(idx, 1); else config.ignoredRoles.push(id);
    config.markModified('ignoredRoles'); await config.save();
    return sel.update({ embeds: [mainPanelEmbed(config, interaction.guild)], components: buildMainRows(config) });
}
