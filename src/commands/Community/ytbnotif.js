const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ComponentType,
} = require('discord.js');

const YoutubeNotif = require('../../schemas/YoutubeNotif');
const { resolveYoutubeChannel } = require('../../functions/youtubeUtils');

const COLLECTOR_TIMEOUT = 5 * 60 * 1000;

const TYPE_LABELS = {
    video: '🎬 Vidéos uniquement',
    live:  '🔴 Lives uniquement',
    both:  '📡 Vidéos + Lives',
};

const TYPE_SHORT = {
    video: '🎬 Vidéos',
    live:  '🔴 Lives',
    both:  '📡 Les deux',
};

module.exports = {
    disabled: false,
    data: new SlashCommandBuilder()
        .setName('ytbnotif')
        .setDescription('📺 Système de notifications YouTube')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('➕ Configurer une notification pour une chaîne YouTube')
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('📋 Voir toutes les chaînes surveillées')
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('🗑️ Supprimer une notification YouTube')
        ),

    userPermissions: ['ManageGuild'],

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'setup') return handleSetup(interaction, client);
        if (sub === 'list')  return handleList(interaction, client);
        if (sub === 'remove') return handleRemove(interaction, client);
    }
};

async function handleSetup(interaction, client) {
    const count = await YoutubeNotif.countDocuments({ guildId: interaction.guildId });
    if (count >= 10) {
        return interaction.reply({
            embeds: [errorEmbed('Limite atteinte', 'Maximum **10 chaînes** par serveur.\nUtilisez `/ytbnotif remove` pour en supprimer une.')],
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('ytbnotif_url_modal')
        .setTitle('YouTube Notifs — Étape 1/4');

    const urlInput = new TextInputBuilder()
        .setCustomId('youtube_url')
        .setLabel('URL de la chaîne YouTube')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://youtube.com/@NomDeLaChaine')
        .setRequired(true);

    const msgVideoInput = new TextInputBuilder()
        .setCustomId('notif_message')
        .setLabel('Message — Nouvelles vidéos')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('{channelName}, {videoTitle}, {videoUrl}')
        .setValue('🎬 **{channelName}** a posté une vidéo !\n\n**{videoTitle}**\n👉 {videoUrl}')
        .setRequired(true)
        .setMaxLength(500);

    modal.addComponents(
        new ActionRowBuilder().addComponents(urlInput),
        new ActionRowBuilder().addComponents(msgVideoInput),
    );

    await interaction.showModal(modal);

    let modalInteraction;
    try {
        modalInteraction = await interaction.awaitModalSubmit({
            filter: i => i.customId === 'ytbnotif_url_modal' && i.user.id === interaction.user.id,
            time: 120_000
        });
    } catch {
        return;
    }

    await modalInteraction.deferReply({ ephemeral: true });

    const rawUrl      = modalInteraction.fields.getTextInputValue('youtube_url').trim();
    const notifMessage = modalInteraction.fields.getTextInputValue('notif_message').trim();

    let channelInfo;
    try {
        channelInfo = await resolveYoutubeChannel(rawUrl);
    } catch (err) {
        return modalInteraction.editReply({
            embeds: [errorEmbed('Chaîne introuvable', err.message)]
        });
    }

    const existing = await YoutubeNotif.findOne({
        guildId: interaction.guildId,
        youtubeChannelId: channelInfo.channelId
    });
    if (existing) {
        return modalInteraction.editReply({
            embeds: [errorEmbed('Déjà configurée', `**${channelInfo.channelName}** est déjà surveillée.`)]
        });
    }

    const typeEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('YouTube Notifs — Étape 2/4')
        .setDescription(`✅ **[${channelInfo.channelName}](${channelInfo.channelUrl})** trouvée !\n\n**Que voulez-vous détecter ?**`)
        .setThumbnail(channelInfo.thumbnail)
        .addFields({
            name: 'Types disponibles',
            value: '🎬 **Vidéos** — nouvelles vidéos publiées\n🔴 **Lives** — quand la chaîne passe en direct\n📡 **Les deux** — vidéos + lives'
        })
        .setFooter({ text: 'Vous pourrez configurer les messages séparément' });

    const typeSelect = new StringSelectMenuBuilder()
        .setCustomId('ytbnotif_type_select')
        .setPlaceholder('Choisir le type de notification...')
        .addOptions([
            { label: 'Vidéos uniquement', description: 'Notif quand une nouvelle vidéo est publiée', value: 'video', emoji: '🎬' },
            { label: 'Lives uniquement',  description: 'Notif quand la chaîne passe en direct',      value: 'live',  emoji: '🔴' },
            { label: 'Vidéos + Lives',    description: 'Notif pour les deux types de contenu',        value: 'both',  emoji: '📡' },
        ]);

    const cancelBtn = new ButtonBuilder()
        .setCustomId('ytbnotif_cancel')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Danger);

    const typeMsg = await modalInteraction.editReply({
        embeds: [typeEmbed],
        components: [
            new ActionRowBuilder().addComponents(typeSelect),
            new ActionRowBuilder().addComponents(cancelBtn),
        ]
    });

    let notifType;
    try {
        const typeInteraction = await typeMsg.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: COLLECTOR_TIMEOUT,
            componentType: ComponentType.StringSelect,
        });
        notifType = typeInteraction.values[0];
        await typeInteraction.deferUpdate();
    } catch {
        return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
    }

    let liveMessage = '🔴 **{channelName}** est en LIVE !\n\n**{videoTitle}**\n🎙️ {videoUrl}';

    if (notifType === 'live' || notifType === 'both') {
        const liveModalBtn = new ButtonBuilder()
            .setCustomId('ytbnotif_open_live_modal')
            .setLabel('Personnaliser le message live')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✏️');

        const skipBtn = new ButtonBuilder()
            .setCustomId('ytbnotif_skip_live_msg')
            .setLabel('Garder le message par défaut')
            .setStyle(ButtonStyle.Secondary);

        const liveMsgEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('YouTube Notifs — Étape 2.5/4')
            .setDescription('Voulez-vous personnaliser le message pour les **lives** ?')
            .addFields({
                name: 'Message par défaut',
                value: `\`\`\`${liveMessage}\`\`\``
            })
            .addFields({
                name: 'Variables disponibles',
                value: '`{channelName}` · `{videoTitle}` · `{videoUrl}`'
            });

        const liveMsgMsg = await modalInteraction.editReply({
            embeds: [liveMsgEmbed],
            components: [new ActionRowBuilder().addComponents(liveModalBtn, skipBtn, cancelBtn)]
        });

        try {
            const liveBtnInteraction = await liveMsgMsg.awaitMessageComponent({
                filter: i => i.user.id === interaction.user.id,
                time: COLLECTOR_TIMEOUT,
            });

            if (liveBtnInteraction.customId === 'ytbnotif_cancel') {
                await liveBtnInteraction.deferUpdate();
                return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
            }

            if (liveBtnInteraction.customId === 'ytbnotif_open_live_modal') {
                const liveModal = new ModalBuilder()
                    .setCustomId('ytbnotif_live_msg_modal')
                    .setTitle('Message pour les Lives');

                const liveMsgInput = new TextInputBuilder()
                    .setCustomId('live_message')
                    .setLabel('Message — Lives')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('{channelName}, {videoTitle}, {videoUrl}')
                    .setValue(liveMessage)
                    .setRequired(true)
                    .setMaxLength(500);

                liveModal.addComponents(new ActionRowBuilder().addComponents(liveMsgInput));
                await liveBtnInteraction.showModal(liveModal);

                try {
                    const liveModalSubmit = await liveBtnInteraction.awaitModalSubmit({
                        filter: i => i.customId === 'ytbnotif_live_msg_modal' && i.user.id === interaction.user.id,
                        time: 90_000,
                    });
                    liveMessage = liveModalSubmit.fields.getTextInputValue('live_message').trim();
                    await liveModalSubmit.deferUpdate();
                } catch {
                   
                }
            } else {
               
                await liveBtnInteraction.deferUpdate();
            }
        } catch {
            return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
        }
    }

    const step3Embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('YouTube Notifs — Étape 3/4')
        .setDescription(`**Dans quel salon envoyer les notifications ?**`)
        .setThumbnail(channelInfo.thumbnail)
        .setFooter({ text: 'Sélectionnez un salon textuel' });

    const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('ytbnotif_channel_select')
        .setPlaceholder('Choisir un salon...')
        .setChannelTypes([0]);

    const step3Msg = await modalInteraction.editReply({
        embeds: [step3Embed],
        components: [
            new ActionRowBuilder().addComponents(channelSelect),
            new ActionRowBuilder().addComponents(cancelBtn),
        ]
    });

    let discordChannelId;
    try {
        const channelInteraction = await step3Msg.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: COLLECTOR_TIMEOUT,
            componentType: ComponentType.ChannelSelect,
        });
        discordChannelId = channelInteraction.values[0];
        await channelInteraction.deferUpdate();
    } catch {
        return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
    }

    const step4Embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('YouTube Notifs — Étape 4/4')
        .setDescription('**Quelle mention envoyer avec la notification ?**\n\nSélectionne un rôle ou utilise les boutons.')
        .setThumbnail(channelInfo.thumbnail)
        .setFooter({ text: 'Étape optionnelle' });

    const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId('ytbnotif_role_select')
        .setPlaceholder('Choisir un rôle...');

    const everyoneBtn = new ButtonBuilder()
        .setCustomId('ytbnotif_everyone')
        .setLabel('@everyone')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📢');

    const noMentionBtn = new ButtonBuilder()
        .setCustomId('ytbnotif_nomention')
        .setLabel('Aucune mention')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔕');

    const step4Msg = await modalInteraction.editReply({
        embeds: [step4Embed],
        components: [
            new ActionRowBuilder().addComponents(roleSelect),
            new ActionRowBuilder().addComponents(everyoneBtn, noMentionBtn, cancelBtn),
        ]
    });

    let mentionId = null;
    try {
        const mentionInteraction = await step4Msg.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: COLLECTOR_TIMEOUT,
        });

        if (mentionInteraction.customId === 'ytbnotif_cancel') {
            await mentionInteraction.deferUpdate();
            return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
        } else if (mentionInteraction.customId === 'ytbnotif_everyone') {
            mentionId = 'everyone';
        } else if (mentionInteraction.customId === 'ytbnotif_nomention') {
            mentionId = null;
        } else if (mentionInteraction.customId === 'ytbnotif_role_select') {
            mentionId = mentionInteraction.values[0];
        }

        await mentionInteraction.deferUpdate();
    } catch {
        return modalInteraction.editReply({ embeds: [cancelEmbed()], components: [] });
    }

    try {
        await YoutubeNotif.create({
            guildId: interaction.guildId,
            channelId: discordChannelId,
            youtubeChannelId: channelInfo.channelId,
            youtubeChannelName: channelInfo.channelName,
            youtubeChannelUrl: channelInfo.channelUrl,
            youtubeChannelThumbnail: channelInfo.thumbnail,
            notifType: notifType,
            notifMessage: notifMessage,
            liveMessage: liveMessage,
            mentionId: mentionId,
            lastVideoId: null,
            lastLiveId: null,
            addedBy: interaction.user.id,
        });
    } catch (err) {
        console.error('[YouTube Setup] Erreur save:', err);
        return modalInteraction.editReply({
            embeds: [errorEmbed('Erreur', 'Une erreur est survenue lors de la sauvegarde.')],
            components: []
        });
    }

    const discordChan = await interaction.guild.channels.fetch(discordChannelId).catch(() => null);
    const mentionDisplay = mentionId === 'everyone'
        ? '@everyone'
        : mentionId
            ? `<@&${mentionId}>`
            : 'Aucune';

    const msgPreview   = notifMessage.length > 200 ? notifMessage.slice(0, 197) + '...' : notifMessage;
    const liveMsgPreview = liveMessage.length > 200 ? liveMessage.slice(0, 197) + '...' : liveMessage;

    const successEmbedResult = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Notification YouTube configurée !')
        .setThumbnail(channelInfo.thumbnail)
        .addFields(
            { name: '📺 Chaîne', value: `[${channelInfo.channelName}](${channelInfo.channelUrl})`, inline: true },
            { name: '📢 Salon',  value: discordChan ? `<#${discordChan.id}>` : `<#${discordChannelId}>`, inline: true },
            { name: '🔔 Mention', value: mentionDisplay, inline: true },
            { name: '📡 Type', value: TYPE_LABELS[notifType], inline: false },
            { name: '💬 Msg vidéo', value: `\`\`\`${msgPreview}\`\`\`` },
        );

    if (notifType === 'live' || notifType === 'both') {
        successEmbedResult.addFields({ name: '🔴 Msg live', value: `\`\`\`${liveMsgPreview}\`\`\`` });
    }

    successEmbedResult
        .setFooter({ text: 'Vérification toutes les 5 minutes' })
        .setTimestamp();

    await modalInteraction.editReply({ embeds: [successEmbedResult], components: [] });
}

async function handleList(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const configs = await YoutubeNotif.find({ guildId: interaction.guildId });

    if (!configs.length) {
        return interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📋 Notifications YouTube')
                .setDescription('Aucune chaîne configurée.\nUtilisez `/ytbnotif setup` pour commencer !')
            ]
        });
    }

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`📺 Notifications YouTube — ${configs.length}/10`)
        .setTimestamp();

    for (const cfg of configs) {
        const mention = cfg.mentionId === 'everyone'
            ? '@everyone'
            : cfg.mentionId
                ? `<@&${cfg.mentionId}>`
                : 'Aucune';

        const lastCheck = cfg.lastChecked
            ? `<t:${Math.floor(cfg.lastChecked.getTime() / 1000)}:R>`
            : 'Jamais';

        const lastVid  = cfg.lastVideoId ? `[Voir](https://youtu.be/${cfg.lastVideoId})` : '—';
        const lastLive = cfg.lastLiveId  ? `[Voir](https://youtu.be/${cfg.lastLiveId})` : '—';

        const lines = [
            `**Salon:** <#${cfg.channelId}>`,
            `**Type:** ${TYPE_SHORT[cfg.notifType] || cfg.notifType}`,
            `**Mention:** ${mention}`,
            `**Dernier check:** ${lastCheck}`,
            `**Dernière vidéo:** ${lastVid}`,
        ];

        if (cfg.notifType === 'live' || cfg.notifType === 'both') {
            lines.push(`**Dernier live:** ${lastLive}`);
        }

        lines.push(`**ID:** \`${cfg.youtubeChannelId}\``);

        embed.addFields({
            name: `${cfg.enabled ? '🟢' : '🔴'} ${cfg.youtubeChannelName}`,
            value: lines.join('\n'),
            inline: false
        });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleRemove(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const configs = await YoutubeNotif.find({ guildId: interaction.guildId });

    if (!configs.length) {
        return interaction.editReply({
            embeds: [errorEmbed('Aucune config', 'Aucune chaîne YouTube configurée sur ce serveur.')]
        });
    }

    const options = configs.map(cfg => ({
        label: cfg.youtubeChannelName.slice(0, 25),
        description: `${TYPE_SHORT[cfg.notifType] || 'Notifs'} · #${cfg.channelId}`.slice(0, 100),
        value: cfg.youtubeChannelId,
        emoji: '📺'
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ytbnotif_remove_select')
        .setPlaceholder('Choisir la chaîne à supprimer...')
        .addOptions(options);

    const cancelBtn = new ButtonBuilder()
        .setCustomId('ytbnotif_remove_cancel')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);

    const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('🗑️ Supprimer une notification YouTube')
        .setDescription('Sélectionnez la chaîne à supprimer.\n\n⚠️ Cette action est **irréversible**.');

    const msg = await interaction.editReply({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(cancelBtn)
        ]
    });

    let selectedId;
    try {
        const selectInteraction = await msg.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: COLLECTOR_TIMEOUT
        });

        if (selectInteraction.customId === 'ytbnotif_remove_cancel') {
            await selectInteraction.deferUpdate();
            return interaction.editReply({ embeds: [cancelEmbed()], components: [] });
        }

        selectedId = selectInteraction.values[0];
        await selectInteraction.deferUpdate();
    } catch {
        return interaction.editReply({ embeds: [cancelEmbed()], components: [] });
    }

    const config = configs.find(c => c.youtubeChannelId === selectedId);

    const confirmEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('⚠️ Confirmer la suppression')
        .setDescription(`Supprimer la notification pour **${config.youtubeChannelName}** ?`)
        .setThumbnail(config.youtubeChannelThumbnail);

    const confirmBtn = new ButtonBuilder()
        .setCustomId('ytbnotif_confirm_delete')
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️');

    const cancelBtn2 = new ButtonBuilder()
        .setCustomId('ytbnotif_cancel_delete')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary);

    const confirmMsg = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [new ActionRowBuilder().addComponents(confirmBtn, cancelBtn2)]
    });

    try {
        const confirmInteraction = await confirmMsg.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: 30_000
        });

        await confirmInteraction.deferUpdate();

        if (confirmInteraction.customId === 'ytbnotif_cancel_delete') {
            return interaction.editReply({ embeds: [cancelEmbed()], components: [] });
        }

        await YoutubeNotif.deleteOne({ guildId: interaction.guildId, youtubeChannelId: selectedId });

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Notification supprimée')
                .setDescription(`La notification pour **${config.youtubeChannelName}** a été supprimée.`)
            ],
            components: []
        });
    } catch {
        return interaction.editReply({ embeds: [cancelEmbed()], components: [] });
    }
}

function errorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`❌ ${title}`)
        .setDescription(description);
}

function cancelEmbed() {
    return new EmbedBuilder()
        .setColor(0x99AAB5)
        .setTitle('↩️ Action annulée')
        .setDescription('La configuration a été annulée.');
}
