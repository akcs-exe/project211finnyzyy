const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    disabled: false,

    data: new SlashCommandBuilder()
        .setName('211')
        .setDescription('En savoir plus sur la 211 Organisation.'),

    async execute(interaction, client) {
        try {
            const E = {
                logo: '<:favicon:1493955135951474698>',
            };

            const embed = new EmbedBuilder()
                .setColor(0xD62828)
                .setAuthor({
                    name: '211 Organisation',
                    iconURL: 'https://media.discordapp.net/attachments/1493948970400219206/1493955428676272159/favicon.png?ex=69e0d9ea&is=69df886a&hm=436baf74138d2b0cc13f6fc886b02cdba1fd05d707d063984710a26175125c5d&=&format=webp&quality=lossless',
                    url: 'https://211organisation.com/',
                })
                .setDescription(
                    `Protection de l'enfance & lutte contre la pédocriminalité.\n` +
                    `-# 100% bénévoles  ·  24/7  ·  Français`
                )
                .addFields(
                    {
                        name: '‎',
                        value:
                            `<:starsss:1493954460429451365> **Mission**\n` +
                            `Identifier les cyberprédateurs, les signaler aux autorités et accompagner les victimes.\n` +
                            `-# 95 % des alertes traitées en moins de 24h.`,
                        inline: false,
                    },
                    {
                        name: '‎',
                        value:
                            `<:shields:1493954760959721482> **Soutien**\n` +
                            `Informer · Sensibiliser · Agir.`,
                        inline: false,
                    },
                    {
                        name: '‎',
                        value:
                            `<:staff:1493954292141527131> **Nous retrouver**\n` +
                            `[Site officiel](https://211organisation.com/)  ·  [Faire un don](https://www.helloasso.com/associations/211-organisation/formulaires/1)`,
                        inline: false,
                    },
                )
                .setImage('https://media.discordapp.net/attachments/1493715475706937525/1493940885933523046/banner.png?ex=69e0cc5f&is=69df7adf&hm=f3bb59f3b9cf540756dbed1ba2a598cad939f2647e52f9b2dd643c9682cb0950&=&format=webp&quality=lossless&width=1524&height=856')
                .setFooter({ text: '211 Organisation · Ensemble, protégeons nos enfants.' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Site officiel')
                        .setEmoji('🌐')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://211organisation.com/'),
                    new ButtonBuilder()
                        .setLabel('Faire un don')
                        .setEmoji('🤍')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://www.helloasso.com/associations/211-organisation/formulaires/1'),
                    new ButtonBuilder()
                        .setLabel('Signaler')
                        .setEmoji('🚨')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://211organisation.com/'),
                );

            await interaction.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('[/211] Erreur :', error);
            await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
        }
    },
};
