/**
 * Calcule l'XP nécessaire pour atteindre un niveau donné
 * Formule : 5 * level^2 + 50 * level + 100
 */
function xpForLevel(level) {
    return 5 * Math.pow(level, 2) + 50 * level + 100;
}

function levelFromXp(totalXp) {
    let level = 0;
    let remaining = totalXp;
    while (remaining >= xpForLevel(level)) {
        remaining -= xpForLevel(level);
        level++;
    }
    return { level, currentXp: remaining };
}


function totalXpForLevel(level) {
    let total = 0;
    for (let i = 0; i < level; i++) total += xpForLevel(i);
    return total;
}


function levelProgress(totalXp) {
    const { level, currentXp } = levelFromXp(totalXp);
    const needed = xpForLevel(level);
    return { level, currentXp, needed, progress: currentXp / needed };
}


async function getRank(userId, guildId) {
    const Level = require('../schemas/Level');
    const user = await Level.findOne({ userId, guildId });
    if (!user) return null;
    const rank = await Level.countDocuments({ guildId, xp: { $gt: user.xp } });
    return { rank: rank + 1, user };
}


function formatXp(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

module.exports = { xpForLevel, levelFromXp, totalXpForLevel, levelProgress, getRank, formatXp };
