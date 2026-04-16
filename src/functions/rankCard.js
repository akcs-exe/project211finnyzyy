const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { levelProgress, formatXp } = require('./xpUtils');

const THEMES = {
    novice: {
        bg: ['#0a0e1a', '#0d1530'], accent: '#3d7aff', accentGlow: 'rgba(61,122,255,0.35)',
        bar: ['#1a4fff', '#3d7aff'], barGlow: 'rgba(61,122,255,0.6)',
        text: '#e8f0ff', sub: '#6b82b8', border: '#1e3a8a', ring: ['#1a4fff', '#3d7aff'], label: 'NOVICE',
    },
    adept: {
        bg: ['#071a0e', '#0e2b16'], accent: '#00e676', accentGlow: 'rgba(0,230,118,0.3)',
        bar: ['#00c853', '#00e676'], barGlow: 'rgba(0,230,118,0.6)',
        text: '#e8fff3', sub: '#4db36a', border: '#1b5e20', ring: ['#00c853', '#69f0ae'], label: 'ADEPT',
    },
    expert: {
        bg: ['#10071a', '#1a0d2e'], accent: '#ce93d8', accentGlow: 'rgba(206,147,216,0.35)',
        bar: ['#9c27b0', '#ce93d8'], barGlow: 'rgba(206,147,216,0.6)',
        text: '#f3e5ff', sub: '#9575cd', border: '#4a148c', ring: ['#9c27b0', '#ea80fc'], label: 'EXPERT',
    },
    elite: {
        bg: ['#1a0800', '#2d1000'], accent: '#ff6d00', accentGlow: 'rgba(255,109,0,0.35)',
        bar: ['#e65100', '#ff9800'], barGlow: 'rgba(255,152,0,0.6)',
        text: '#fff3e0', sub: '#bf6010', border: '#e65100', ring: ['#ff6d00', '#ffcc02'], label: 'ÉLITE',
    },
    legend: {
        bg: ['#001a1a', '#002828'], accent: '#00e5ff', accentGlow: 'rgba(0,229,255,0.35)',
        bar: ['#0097a7', '#00e5ff'], barGlow: 'rgba(0,229,255,0.6)',
        text: '#e0ffff', sub: '#4db6c7', border: '#006064', ring: ['#00bcd4', '#00e5ff'], label: 'LÉGENDE',
    },
    shinigami: {
        bg: ['#0d0000', '#1a0505'], accent: '#e53935', accentGlow: 'rgba(229,57,53,0.4)',
        bar: ['#b71c1c', '#e53935'], barGlow: 'rgba(229,57,53,0.7)',
        text: '#ffebee', sub: '#c62828', border: '#7f0000', ring: ['#7f0000', '#e53935', '#ff5252'], label: 'SHINIGAMI',
    },
    shinigami_confirmed: {
        bg: ['#100505', '#1e0a0a'], accent: '#ff6659', accentGlow: 'rgba(255,102,89,0.4)',
        bar: ['#c62828', '#ff6659'], barGlow: 'rgba(255,102,89,0.7)',
        text: '#fff8f7', sub: '#d4756c', border: '#8d2e2e', ring: ['#c62828', '#ff6659', '#ffd5d2'], label: 'SHINIGAMI CONFIRMÉ',
    },
    executeur: {
        bg: ['#0a0014', '#120020'], accent: '#9c27b0', accentGlow: 'rgba(156,39,176,0.4)',
        bar: ['#6a0080', '#9c27b0'], barGlow: 'rgba(156,39,176,0.7)',
        text: '#f3e5f5', sub: '#8e3fa8', border: '#4a0072', ring: ['#4a0072', '#9c27b0', '#e040fb'], label: 'EXÉCUTEUR',
    },
    stratege: {
        bg: ['#060c14', '#0c1826'], accent: '#4fc3f7', accentGlow: 'rgba(79,195,247,0.35)',
        bar: ['#0277bd', '#4fc3f7'], barGlow: 'rgba(79,195,247,0.65)',
        text: '#e1f5fe', sub: '#5b8fa8', border: '#014b7a', ring: ['#0277bd', '#4fc3f7', '#b3e5fc'], label: 'STRATÈGE',
    },
    autorite_occulte: {
        bg: ['#080808', '#111111'], accent: '#bdbdbd', accentGlow: 'rgba(189,189,189,0.3)',
        bar: ['#616161', '#bdbdbd'], barGlow: 'rgba(189,189,189,0.55)',
        text: '#f5f5f5', sub: '#757575', border: '#424242', ring: ['#424242', '#bdbdbd', '#eeeeee'], label: 'AUTORITÉ OCCULTE',
    },
    voix_justice: {
        bg: ['#040b1a', '#071428'], accent: '#ffc107', accentGlow: 'rgba(255,193,7,0.35)',
        bar: ['#1565c0', '#ffc107'], barGlow: 'rgba(255,193,7,0.65)',
        text: '#fffde7', sub: '#9e8833', border: '#1a237e', ring: ['#1565c0', '#ffc107', '#fff176'], label: 'VOIX DE LA JUSTICE',
    },
    architecte: {
        bg: ['#120a00', '#1e1000'], accent: '#ff8f00', accentGlow: 'rgba(255,143,0,0.35)',
        bar: ['#e65100', '#ff8f00'], barGlow: 'rgba(255,143,0,0.65)',
        text: '#fff8e1', sub: '#b86a00', border: '#7c3f00', ring: ['#7c3f00', '#ff8f00', '#ffe082'], label: 'ARCHITECTE',
    },
    main_invisible: {
        bg: ['#1a0a10', '#2a0d18'], accent: '#f48fb1', accentGlow: 'rgba(244,143,177,0.35)',
        bar: ['#c2185b', '#f48fb1'], barGlow: 'rgba(244,143,177,0.65)',
        text: '#fce4ec', sub: '#c26882', border: '#880e4f', ring: ['#880e4f', '#f48fb1', '#fce4ec'], label: 'MAIN INVISIBLE',
    },
    dominateur: {
        bg: ['#0f0010', '#1a001e'], accent: '#e040fb', accentGlow: 'rgba(224,64,251,0.4)',
        bar: ['#aa00ff', '#e040fb'], barGlow: 'rgba(224,64,251,0.75)',
        text: '#f3e5f5', sub: '#ab47bc', border: '#6a0080', ring: ['#6a0080', '#e040fb', '#f3b3ff'], label: 'DOMINATEUR',
    },
    symbole: {
        bg: ['#120c00', '#201400'], accent: '#ffb300', accentGlow: 'rgba(255,179,0,0.4)',
        bar: ['#ff6f00', '#ffb300'], barGlow: 'rgba(255,179,0,0.7)',
        text: '#fff8e1', sub: '#c68a00', border: '#7c5200', ring: ['#7c5200', '#ffb300', '#ffe57f'], label: 'SYMBOLE',
    },
    volonte_absolue: {
        bg: ['#100000', '#1e0000'], accent: '#ff1744', accentGlow: 'rgba(255,23,68,0.45)',
        bar: ['#d50000', '#ff1744'], barGlow: 'rgba(255,23,68,0.8)',
        text: '#ffffff', sub: '#ef9a9a', border: '#7f0000', ring: ['#7f0000', '#ff1744', '#ffffff'], label: 'VOLONTÉ ABSOLUE',
    },
    ordre: {
        bg: ['#0a0a0a', '#141414'], accent: '#eceff1', accentGlow: 'rgba(236,239,241,0.3)',
        bar: ['#90a4ae', '#eceff1'], barGlow: 'rgba(236,239,241,0.6)',
        text: '#ffffff', sub: '#90a4ae', border: '#546e7a', ring: ['#546e7a', '#eceff1', '#ffffff'], label: 'ORDRE',
    },
    loi: {
        bg: ['#0e0c00', '#1c1800'], accent: '#ffd54f', accentGlow: 'rgba(255,213,79,0.45)',
        bar: ['#f9a825', '#ffd54f'], barGlow: 'rgba(255,213,79,0.8)',
        text: '#fffff0', sub: '#c8a900', border: '#f57f17', ring: ['#f57f17', '#ffd54f', '#fffde7'], label: 'LOI',
    },
    nouveau_monde: {
        bg: ['#0a0a00', '#141400'], accent: '#ffffff', accentGlow: 'rgba(255,255,255,0.5)',
        bar: ['#ffd600', '#ffffff'], barGlow: 'rgba(255,255,255,0.9)',
        text: '#ffffff', sub: '#e0d090', border: '#ffd600', ring: ['#ffd600', '#ffffff', '#ffd600', '#ffffff'], label: 'NOUVEAU MONDE',
    },
};

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function darkenHex(hex, factor = 0.15) {
    const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
    const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
    const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function themeFromColor(hex, label) {
    const dark1 = darkenHex(hex, 0.08);
    const dark2 = darkenHex(hex, 0.14);
    return {
        bg: [dark1, dark2],
        accent: hex,
        accentGlow: hexToRgba(hex, 0.4),
        bar: [darkenHex(hex, 0.6), hex],
        barGlow: hexToRgba(hex, 0.65),
        text: '#ffffff',
        sub: hexToRgba(hex, 0.7),
        border: darkenHex(hex, 0.4),
        ring: [darkenHex(hex, 0.5), hex, '#ffffff'],
        label: (label || 'CUSTOM').toUpperCase().slice(0, 20),
    };
}

function resolveTheme({ level, roleColor, roleLabel, cardTheme, cardAccentColor, cardColorFromRole }) {
    if (cardColorFromRole && roleColor && roleColor !== '#000000') {
        return themeFromColor(roleColor, roleLabel);
    }

    if (cardAccentColor) {
        const base = getBaseTheme(level, cardTheme);
        base.accent = cardAccentColor;
        base.accentGlow = hexToRgba(cardAccentColor, 0.4);
        base.bar = [cardAccentColor, cardAccentColor];
        base.barGlow = hexToRgba(cardAccentColor, 0.65);
        base.ring = [cardAccentColor, cardAccentColor];
        return base;
    }

    return getBaseTheme(level, cardTheme);
}

function getBaseTheme(level, overrideTheme) {
    if (overrideTheme && overrideTheme !== 'auto' && THEMES[overrideTheme]) {
        return { ...THEMES[overrideTheme] };
    }
    if (level >= 1000) return { ...THEMES.nouveau_monde };
    if (level >= 900)  return { ...THEMES.loi };
    if (level >= 800)  return { ...THEMES.ordre };
    if (level >= 700)  return { ...THEMES.volonte_absolue };
    if (level >= 600)  return { ...THEMES.symbole };
    if (level >= 500)  return { ...THEMES.dominateur };
    if (level >= 450)  return { ...THEMES.main_invisible };
    if (level >= 400)  return { ...THEMES.architecte };
    if (level >= 350)  return { ...THEMES.voix_justice };
    if (level >= 300)  return { ...THEMES.autorite_occulte };
    if (level >= 250)  return { ...THEMES.stratege };
    if (level >= 200)  return { ...THEMES.executeur };
    if (level >= 150)  return { ...THEMES.shinigami_confirmed };
    if (level >= 100)  return { ...THEMES.shinigami };
    if (level >= 75)   return { ...THEMES.legend };
    if (level >= 50)   return { ...THEMES.elite };
    if (level >= 25)   return { ...THEMES.expert };
    if (level >= 10)   return { ...THEMES.adept };
    return { ...THEMES.novice };
}


function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

async function drawAvatar(ctx, avatarUrl, cx, cy, radius, ringColors) {
    const ringGrad = ctx.createLinearGradient(cx - radius - 4, cy - radius - 4, cx + radius + 4, cy + radius + 4);
    ringColors.forEach((c, i) => ringGrad.addColorStop(i / Math.max(1, ringColors.length - 1), c));

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.shadowColor = ringColors[0];
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    try {
        const img = await loadImage(avatarUrl);
        ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
    } catch {
        const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
        grad.addColorStop(0, '#333');
        grad.addColorStop(1, '#666');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#aaa';
        ctx.font = `bold ${radius}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy);
    }
    ctx.restore();
}

function drawNoise(ctx, w, h, opacity = 0.025) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 255 * opacity;
        data[i]     = Math.min(255, Math.max(0, data[i] + n));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imageData, 0, 0);
}

// ─── GéNéRATEUR PRINCIPAL ─────────────────────────────────────────────────────

/**
 * @param {Object} opts
 * @param {string}   opts.username
 * @param {string}   opts.avatarUrl
 * @param {number}   opts.level
 * @param {number}   opts.currentXp
 * @param {number}   opts.neededXp
 * @param {number}   opts.totalXp
 * @param {number}   opts.rank
 * @param {number}   opts.totalUsers
 * @param {number}   opts.totalMessages
 * @param {string}   [opts.cardTheme]          Thème fixe (null = auto)
 * @param {string}   [opts.cardAccentColor]    Couleur accent fixe (#hex)
 * @param {string}   [opts.backgroundUrl]      Image de fond
 * @param {boolean}  [opts.cardColorFromRole]  Utiliser la couleur du rôle actif
 * @param {string}   [opts.roleColor]          Couleur hex du rôle Discord actif
 * @param {string}   [opts.roleLabel]          Nom du rôle Discord actif
 */
async function generateRankCard(opts) {
    const {
        username, avatarUrl, level, currentXp, neededXp,
        totalXp, rank, totalUsers, totalMessages,
        cardTheme, cardAccentColor, backgroundUrl,
        cardColorFromRole, roleColor, roleLabel,
    } = opts;

    const W = 900, H = 250;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    const theme = resolveTheme({
        level,
        roleColor,
        roleLabel,
        cardTheme,
        cardAccentColor,
        cardColorFromRole: cardColorFromRole !== false,
    });

    const progress = Math.min(currentXp / Math.max(1, neededXp), 1);

    let bgLoaded = false;
    if (backgroundUrl) {
        try {
            const bg = await loadImage(backgroundUrl);
            ctx.save();
            roundRect(ctx, 0, 0, W, H, 20);
            ctx.clip();
            ctx.drawImage(bg, 0, 0, W, H);
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
            bgLoaded = true;
        } catch {}
    }

    if (!bgLoaded) {
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, theme.bg[0]);
        bgGrad.addColorStop(1, theme.bg[1]);
        roundRect(ctx, 0, 0, W, H, 20);
        ctx.fillStyle = bgGrad;
        ctx.fill();

        ctx.save();
        roundRect(ctx, 0, 0, W, H, 20);
        ctx.clip();
        ctx.strokeStyle = theme.accent + '12';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        ctx.restore();

        const orb = ctx.createRadialGradient(W * 0.75, H * 0.3, 0, W * 0.75, H * 0.3, 280);
        orb.addColorStop(0, theme.accentGlow);
        orb.addColorStop(1, 'transparent');
        ctx.fillStyle = orb;
        ctx.fillRect(0, 0, W, H);
    }

    ctx.save();
    roundRect(ctx, 1, 1, W - 2, H - 2, 20);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    const AV_CX = 110, AV_CY = H / 2, AV_R = 72;
    await drawAvatar(ctx, avatarUrl, AV_CX, AV_CY, AV_R, theme.ring);

    const BADGE_R = 22;
    const [r1, r2] = theme.ring;
    const badgeGrad = ctx.createLinearGradient(AV_CX + 30, AV_CY + 26, AV_CX + 74, AV_CY + 70);
    badgeGrad.addColorStop(0, r1);
    badgeGrad.addColorStop(1, r2);

    ctx.save();
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(AV_CX + 52, AV_CY + 48, BADGE_R, 0, Math.PI * 2);
    ctx.fillStyle = theme.bg[0];
    ctx.fill();
    ctx.strokeStyle = badgeGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = theme.accent;
    ctx.font = `bold 13px "Arial"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(level), AV_CX + 52, AV_CY + 48);

    const TX = 205, TY_TOP = 55;

    const tagLabel = theme.label;
    ctx.save();
    ctx.font = `700 10px "Arial"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tagW = ctx.measureText(tagLabel).width + 18;
    const tagH = 18;
    const tagX = TX, tagY = TY_TOP - 10;

    roundRect(ctx, tagX, tagY, tagW, tagH, 4);
    const tagGrad = ctx.createLinearGradient(tagX, tagY, tagX + tagW, tagY);
    tagGrad.addColorStop(0, theme.accent + '33');
    tagGrad.addColorStop(1, theme.accent + '11');
    ctx.fillStyle = tagGrad;
    ctx.fill();
    roundRect(ctx, tagX, tagY, tagW, tagH, 4);
    ctx.strokeStyle = theme.accent + '66';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = theme.accent;
    ctx.font = `700 10px "Arial"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagLabel, tagX + 9, tagY + tagH / 2);

    ctx.save();
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 12;
    ctx.fillStyle = theme.text;
    ctx.font = `bold 38px "Arial"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const displayName = username.length > 16 ? username.slice(0, 15) + '…' : username;
    ctx.fillText(displayName, TX, TY_TOP + 12);
    ctx.restore();

    const xpText = `${formatXp(currentXp)} / ${formatXp(neededXp)} XP`;
    ctx.fillStyle = theme.sub;
    ctx.font = `400 14px "Arial"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(xpText, TX, TY_TOP + 60);

    const BAR_X = TX, BAR_Y = H - 78;
    const BAR_W = W - TX - 40, BAR_H = 18;
    const BAR_R = BAR_H / 2;
    const filledW = Math.max(BAR_R * 2, BAR_W * progress);

    roundRect(ctx, BAR_X, BAR_Y, BAR_W, BAR_H, BAR_R);
    ctx.fillStyle = theme.accent + '20';
    ctx.fill();
    roundRect(ctx, BAR_X, BAR_Y, BAR_W, BAR_H, BAR_R);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    const fillGrad = ctx.createLinearGradient(BAR_X, 0, BAR_X + BAR_W, 0);
    theme.bar.forEach((c, i) => fillGrad.addColorStop(i / Math.max(1, theme.bar.length - 1), c));
    roundRect(ctx, BAR_X, BAR_Y, filledW, BAR_H, BAR_R);
    ctx.save();
    ctx.shadowColor = theme.barGlow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    roundRect(ctx, BAR_X, BAR_Y, filledW, BAR_H / 2, BAR_R);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();

    const pct = Math.round(progress * 100);
    ctx.fillStyle = pct > 45 ? 'rgba(255,255,255,0.9)' : theme.sub;
    ctx.font = `bold 10px "Arial"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${pct}%`, BAR_X + BAR_W / 2, BAR_Y + BAR_H / 2);

    const STAT_Y = H - 42;
    const stats = [
        { label: 'MESSAGES', value: totalMessages.toLocaleString() },
        { label: 'XP TOTAL', value: formatXp(totalXp) },
        { label: 'NIVEAU', value: String(level) },
    ];
    const colW = BAR_W / stats.length;

    stats.forEach((stat, i) => {
        const sx = TX + colW * i;
        ctx.fillStyle = theme.sub;
        ctx.font = `700 9px "Arial"`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(stat.label, sx, STAT_Y);

        ctx.save();
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 6;
        ctx.fillStyle = theme.text;
        ctx.font = `bold 20px "Arial"`;
        ctx.textBaseline = 'top';
        ctx.fillText(stat.value, sx, STAT_Y + 13);
        ctx.restore();
    });

    const RANK_X = W - 40, RANK_Y = 32;

    ctx.fillStyle = theme.sub;
    ctx.font = `700 10px "Arial"`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('RANG', RANK_X, RANK_Y);

    ctx.save();
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 16;
    const rankGrad = ctx.createLinearGradient(RANK_X - 80, RANK_Y, RANK_X, RANK_Y + 60);
    rankGrad.addColorStop(0, theme.accent);
    rankGrad.addColorStop(1, theme.bar[theme.bar.length - 1]);
    ctx.fillStyle = rankGrad;
    ctx.font = `bold 56px "Arial"`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`#${rank}`, RANK_X, RANK_Y + 4);
    ctx.restore();

    ctx.fillStyle = theme.sub;
    ctx.font = `400 12px "Arial"`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`/ ${totalUsers}`, RANK_X, RANK_Y + 64);

    const SEP_X = W - 165;
    const sepGrad = ctx.createLinearGradient(SEP_X, 20, SEP_X, H - 20);
    sepGrad.addColorStop(0, 'transparent');
    sepGrad.addColorStop(0.3, theme.accent + '40');
    sepGrad.addColorStop(0.7, theme.accent + '40');
    sepGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SEP_X, 20);
    ctx.lineTo(SEP_X, H - 20);
    ctx.stroke();

    drawNoise(ctx, W, H, 0.025);

    return canvas.toBuffer('image/png');
}

module.exports = { generateRankCard, THEMES };
