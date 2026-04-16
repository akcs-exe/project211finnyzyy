const { Schema, model, models } = require('mongoose');

const LevelConfigSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },

    enabled: { type: Boolean, default: true },
    xpPerMessage: { type: Number, default: 15 },
    xpVariance: { type: Number, default: 5 },
    xpCooldown: { type: Number, default: 60 },

    levelUpEnabled: { type: Boolean, default: true },
    levelUpChannel: { type: String, default: null },
    levelUpMessage: { type: String, default: '🎉 Bravo {user} ! Tu passes au niveau **{level}** ! 🚀' },

    levelRoles: {
        type: [{
            level:      { type: Number, required: true },
            roleId:     { type: String, required: true },
            remove:     { type: Boolean, default: false },
            cardColor:  { type: String, default: null },  
            cardLabel:  { type: String, default: null },   
        }],
        default: [],
    },

    cardColorFromRole: { type: Boolean, default: true },
    cardTheme:        { type: String, default: null },
    cardAccentColor:  { type: String, default: null },
    cardBackground:   { type: String, default: null },

    ignoredChannels: { type: [String], default: [] },
    ignoredRoles:    { type: [String], default: [] },
}, {
    timestamps: true,
});

module.exports = models.LevelConfig || model('LevelConfig', LevelConfigSchema);