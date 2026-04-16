const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder,
    ComponentType 
} = require('discord.js');

module.exports = {
    disabled: false,

    data: new SlashCommandBuilder()
        .setName('finnyzyy')
        .setDescription('Ouvrir le dossier Finnyzyy — Streamer & traqueur de prédateurs.'),

    async execute(interaction, client) {
        try {
            const COLOR_THEME = 0x0080FF;
            const AVATAR_URL = 'https://static-cdn.jtvnw.net/jtv_user_pictures/f13ce7d4-e4da-4a82-9f14-e7c27b233215-profile_image-300x300.png';
            const BANNER_URL = 'https://i.redd.it/9ymbi09c6gk11.jpg'; 
            const LOGO_211_URL = 'https://media.discordapp.net/attachments/1493948970400219206/1493955428676272159/favicon.png?ex=69e0d9ea&is=69df886a&hm=436baf74138d2b0cc13f6fc886b02cdba1fd05d707d063984710a26175125c5d&=&format=webp&quality=lossless';

            const embedAccueil = new EmbedBuilder()
                .setColor(COLOR_THEME)
                .setAuthor({ name: 'Streamer : FINNYZYY', iconURL: 'https://cdn-icons-png.flaticon.com/512/814/814406.png' })
                .setTitle('🛡️ PIEGER DES PREDATEURS')
                .setURL('https://www.twitch.tv/finnyzyy')
                .setThumbnail(AVATAR_URL)
                .setImage(BANNER_URL)
                .setDescription(
                    `# Finnyzyy\n` +
                    `> **Streamer, Youtubeur, Tiktokeur et Chasseur actif.**\n\n` +
                    `Sa mission principale est de débusquer, exposer et faire condamner les prédateurs qui sévissent sur internet.\n\n` +
                    `### 🎯 Objectifs\n` +
                    `- **Protéger** les plus vulnérables en ligne.\n` +
                    `- **Traquer** et exposer les pédocriminels.\n` +
                    `- **Sensibiliser** le public et les parents.`
                )
                .addFields(
                    { name: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬', value: '\u200B', inline: false },
                    { name: '📺 Contenu', value: `\`🔴\` Lives d'investigation\n\`🎥\` Vidéos prévention\n\`🎮\` Gaming`, inline: true },
                    { name: '📊 Statut', value: `\`🔴\` Hors-Ligne\n\`🔥\` Aucune chasse en cours.`, inline: true }
                )
                .setFooter({ text: 'Finnyzyy · Menu interactif ci-dessous', iconURL: AVATAR_URL })
                .setTimestamp();

            const embedReseaux = new EmbedBuilder()
                .setColor(COLOR_THEME)
                .setTitle('🌐 TRANSMISSIONS & RÉSEAUX')
                .setThumbnail(AVATAR_URL)
                .setDescription(
                    `Rejoignez la communauté et suivez les opérations en direct sur l'ensemble de nos réseaux sociaux.\n\n` +
                    `### 🔴 En Direct\n` +
                    `**[Twitch - @finnyzyy](https://www.twitch.tv/finnyzyy)**\n` +
                    `> Diffusions des chasses, discussions et gaming.\n\n` +
                    `### 📺 Vidéos & Replays\n` +
                    `**[YouTube - @FINNYZYY](https://www.youtube.com/@FINNYZYY)**\n` +
                    `> Best-of, prévention et rediffusions d'interventions.\n\n` +
                    `### 📱 Format Court\n` +
                    `**[TikTok - @finnyzyy0](https://www.tiktok.com/@finnyzyy0?lang=fr)**\n` +
                    `> Clips choc et sensibilisation rapide.\n\n` +
                    `-# ⚠️ Instagram actuellement banni.`
                );

            const embed211 = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('⚔️ AFFILIATION : 211 ORGANISATION')
                .setURL('https://211organisation.com/')
                .setThumbnail(LOGO_211_URL)
                .setDescription(
                    `> *Protection de l'enfance & lutte contre la pédocriminalité.*\n\n` +
                    `Finyzyy opère en étroite collaboration avec la **[211 Organisation](https://211organisation.com/)**.\n\n` +
                    `### Qu'est-ce que la 211 ?\n` +
                    `C'est un collectif engagé dans la lutte active contre la pédocriminalité sur internet. Ils s'occupent de mener des investigations numériques, de récolter des preuves irréfutables et de travailler avec les autorités compétentes pour neutraliser les menaces.`
                );

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_finyzyy')
                    .setPlaceholder('📂 Naviguer dans le dossier...')
                    .addOptions(
                        { label: 'Accueil / Profil', description: 'Mission et présentation', value: 'accueil', emoji: '🛡️' },
                        { label: 'Réseaux Sociaux', description: 'Liens Twitch, YouTube, TikTok', value: 'reseaux', emoji: '🌐' },
                        { label: '211 Organisation', description: 'En savoir plus sur l\'association', value: 'org211', emoji: '⚔️' },
                    )
            );

            const boutonsExternes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('YouTube').setEmoji('▶️').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@FINNYZYY'),
                new ButtonBuilder().setLabel('Twitch').setEmoji('🟣').setStyle(ButtonStyle.Link).setURL('https://www.twitch.tv/finnyzyy'),
                new ButtonBuilder().setLabel('211 Organisation').setEmoji('🛡️').setStyle(ButtonStyle.Link).setURL('https://211organisation.com/')
            );

            const message = await interaction.reply({ 
                embeds: [embedAccueil], 
                components: [selectMenu, boutonsExternes],
                fetchReply: true
            });

            const collector = message.createMessageComponentCollector({ 
                componentType: ComponentType.StringSelect, 
                time: 300_000 
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: '❌ Tu ne peux pas utiliser ce menu. Tape `/finyzyy` toi-même !', ephemeral: true });
                }

                const choix = i.values[0];

                if (choix === 'accueil') await i.update({ embeds: [embedAccueil] });
                else if (choix === 'reseaux') await i.update({ embeds: [embedReseaux] });
                else if (choix === 'org211') await i.update({ embeds: [embed211] });
            });

            collector.on('end', () => {
                const disabledMenu = ActionRowBuilder.from(selectMenu).components[0].setDisabled(true);
                const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
                interaction.editReply({ components: [disabledRow, boutonsExternes] }).catch(() => {});
            });

        } catch (error) {
            console.error('[/finyzyy] Erreur :', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Une erreur est survenue lors de l\'affichage du dossier.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
            }
        }
    },
};
