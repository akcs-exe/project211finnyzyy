const { DiscoBase } = require('discobase-core');
const { GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');
const config = require('../config.json');

mongoose.connect(config.database.mongodbUrl)
    .then(() => console.log('[MongoDB] ✅ Connecté avec succès'))
    .catch(err => console.error('[MongoDB] ❌ Erreur de connexion:', err));

const bot = new DiscoBase({
    clientOptions: {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages
        ]
    }
});

const client = bot.getClient();

client.once('clientReady', () => {
    const { startYoutubeChecker } = require('./functions/youtubeChecker');
    startYoutubeChecker(client);
    const dashboardPath = path.join(__dirname, '../node_modules/discobase-core/admin/dashboard.js');
    require(dashboardPath)(client);
});

bot.start();
