const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    lastMessageTimestamp: { type: Number, default: 0 },
});

levelSchema.index({ guildId: 1, xp: -1 });

module.exports = models.Level || model('Level', levelSchema);
