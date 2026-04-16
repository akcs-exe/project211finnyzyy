<div align="center">

# 🤖 Finyzyy Bot

**Bot Discord complet — Système de niveaux avancé & Notifications YouTube**

[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

## 📋 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Commandes](#-commandes)
- [Système de niveaux](#-système-de-niveaux)
- [Système YouTube](#-système-youtube)
- [Structure du projet](#-structure-du-projet)

---

## ✨ Fonctionnalités

### 🏆 Système de niveaux complet
- Gain d'XP par message avec cooldown et variance configurable
- **Carte de rang visuelle** générée en canvas (PNG) avec thème dynamique
- **18 thèmes** qui changent automatiquement selon le niveau (0 → 1000+)
- **Couleur de carte dynamique selon le rôle** : la carte prend la couleur du rôle reward atteint
- Label personnalisé par rôle (affiché sur la carte)
- Récompenses de rôles automatiques au passage de niveau
- Système de give level avec recalcul XP automatique
- Classement `/rank` et leaderboard
- Panel admin `/levelsetup` complet et interactif

### 📺 Notifications YouTube
- Surveillance de plusieurs chaînes YouTube (max 10 par serveur)
- **Détection automatique live/vidéo** : messages distincts selon le type
- Setup en 4 étapes avec menus interactifs
- Mention de rôle ou @everyone configurable
- Message personnalisable avec variables
- Vérification toutes les 5 minutes via flux RSS (sans clé API)

### 🔧 Général
- Framework **DiscoBase** (auto-chargement commandes/events)
- Base de données MongoDB (Mongoose)
- Dashboard admin intégré

---

## 🚀 Installation

### Prérequis
- **Node.js** v18 ou supérieur
- **MongoDB** (Atlas recommandé)
- Un **bot Discord** créé sur le [Portail Développeur](https://discord.com/developers/applications)

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/votre-username/finyzyy-bot.git
cd finyzyy-bot

# 2. Installer les dépendances
npm install

# 3. Installer le renderer de cartes
npm install @napi-rs/canvas

# 4. Configurer le bot (voir section Configuration)
nano config.json

# 5. Lancer le bot
npm start

# Développement (rechargement automatique)
npm run dev
```

---

## ⚙️ Configuration

Modifiez le fichier `config.json` à la racine :

```json
{
  "bot": {
    "token": "VOTRE_TOKEN_DISCORD",
    "id": "VOTRE_BOT_ID",
    "admins": ["VOTRE_USER_ID"],
    "ownerId": "VOTRE_USER_ID",
    "developerCommandsServerIds": ["ID_SERVEUR_DEV"]
  },
  "database": {
    "mongodbUrl": "mongodb+srv://..."
  },
  "logging": {
    "guildJoinLogsId": "ID_SALON",
    "guildLeaveLogsId": "ID_SALON",
    "commandLogsChannelId": "ID_SALON",
    "errorLogs": "WEBHOOK_URL"
  },
  "prefix": {
    "value": "!"
  }
}
```

### Intents requis sur le portail Discord
- ✅ `SERVER MEMBERS INTENT`
- ✅ `MESSAGE CONTENT INTENT`
- ✅ `PRESENCE INTENT`

---

## 📖 Commandes

### 🏆 Niveaux

| Commande | Description | Permission |
|----------|-------------|------------|
| `/rank [@user]` | Affiche la carte de rang (la tienne ou d'un membre) | Tous |
| `/levelsetup` | Ouvre le panel de configuration des niveaux | `Gérer le serveur` |

### 📺 YouTube

| Commande | Description | Permission |
|----------|-------------|------------|
| `/ytbnotif setup` | Configurer une nouvelle notification | `Gérer le serveur` |
| `/ytbnotif list` | Voir toutes les chaînes surveillées | `Gérer le serveur` |
| `/ytbnotif remove` | Supprimer une notification | `Gérer le serveur` |

### 🔧 Général

| Commande | Description |
|----------|-------------|
| `/ping` | Latence du bot |
| `/211` | Informations sur la 211 Organisation |

---

## 🎮 Système de niveaux

### Fonctionnement de l'XP

Chaque message envoyé (hors cooldown) rapporte de l'XP :
```
XP gagné = xpPerMessage ± variance (aléatoire)
```

La formule de passage de niveau :
```
XP requis pour le niveau N = 5 × N² + 50 × N + 100
```

Exemples :
| Niveau | XP requis pour passer |
|--------|----------------------|
| 0 → 1  | 100 XP               |
| 9 → 10 | 1 040 XP             |
| 24 → 25| 3 600 XP             |
| 49 → 50| 13 100 XP            |
| 99 → 100| 50 100 XP           |

### Panel `/levelsetup`

Le panel interactif permet de configurer :

**⚙️ Paramètres XP**
- XP par message (défaut : 15)
- Variance aléatoire ±(défaut : 5)
- Cooldown entre gains (défaut : 60s)

**🎉 Message de Level-Up**
- Activer/désactiver les notifications
- Choisir un salon dédié (ou même salon)
- Personnaliser le message (`{user}`, `{level}`)

**🎭 Récompenses de rôles**
- Ajouter un rôle reward à un niveau précis
- Définir une **couleur hex** custom pour la carte à ce niveau
- Définir un **label** custom (ex: "ÉLITE DRAGON") affiché sur la carte
- Option : retirer le rôle aux niveaux supérieurs

**🎨 Style des cartes**
- **Couleur auto depuis le rôle** (activé par défaut) : la carte prend la couleur du rôle reward le plus haut atteint par le membre
- Couleur accent fixe globale (override)
- Image de fond custom (URL)
- Réinitialisation du style

**🎁 Give Level** — Donner des niveaux à un membre
- Sélection par menu utilisateur
- Recalcul automatique de l'XP correspondant
- Attribution automatique des rôles rewards si applicable

**🚫 Ignorer** — Salons et rôles exclus du gain XP

### Thèmes de carte

Les 18 thèmes s'appliquent automatiquement selon le niveau, **sauf si un rôle reward avec couleur est actif** :

| Niveaux | Thème | Style |
|---------|-------|-------|
| 0 – 9 | NOVICE | Bleu nuit |
| 10 – 24 | ADEPT | Vert émeraude |
| 25 – 49 | EXPERT | Violet cristal |
| 50 – 74 | ÉLITE | Orange feu |
| 75 – 99 | LÉGENDE | Cyan plasma |
| 100 – 149 | SHINIGAMI | Rouge sang |
| 150 – 199 | SHINIGAMI CONFIRMÉ | Rouge + ivoire |
| 200 – 249 | EXÉCUTEUR | Violet sombre |
| 250 – 299 | STRATÈGE | Bleu acier |
| 300 – 349 | AUTORITÉ OCCULTE | Gris anthracite |
| 350 – 399 | VOIX DE LA JUSTICE | Bleu royal & or |
| 400 – 449 | ARCHITECTE | Bronze chaud |
| 450 – 499 | MAIN INVISIBLE | Rose poudré |
| 500 – 599 | DOMINATEUR | Magenta |
| 600 – 699 | SYMBOLE | Ambre antique |
| 700 – 799 | VOLONTÉ ABSOLUE | Rouge carmin |
| 800 – 899 | ORDRE | Blanc glacial |
| 900 – 999 | LOI | Or divin |
| 1000+ | NOUVEAU MONDE | Or blanc absolu |

---

## 📡 Système YouTube

### Fonctionnement

Le bot surveille les flux RSS YouTube toutes les **5 minutes** et distingue automatiquement :
- 🎬 **Nouvelles vidéos** : publiées sur la chaîne
- 🔴 **Lives** : détection en temps réel quand la chaîne passe en direct

### Setup `/ytbnotif setup`

Configuration en 4 étapes guidées :

1. **URL de la chaîne** + message pour les vidéos normales
2. **Type de notification** : Vidéos / Lives / Les deux
3. **Message live** (si applicable) — personnalisable séparément
4. **Salon Discord** où envoyer les notifications
5. **Mention** : rôle, @everyone, ou aucune

### Variables de message

| Variable | Description |
|----------|-------------|
| `{channelName}` | Nom de la chaîne YouTube |
| `{videoTitle}` | Titre de la vidéo/live |
| `{videoUrl}` | Lien vers la vidéo |

### Formats d'URL supportés

```
https://youtube.com/@NomDeLaChaine
https://youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
UCxxxxxxxxxxxxxxxxxxxxxx  (ID direct)
```

---

## 📁 Structure du projet

```
~Finyzyy/
├── config.json                    # Configuration principale
├── package.json
└── src/
    ├── index.js                   # Point d'entrée
    ├── commands/Community/
    │   ├── rank.js                # /rank — carte de rang
    │   ├── levelsetup.js          # /levelsetup — panel admin niveaux
    │   ├── ytbnotif.js            # /ytbnotif — setup YouTube
    │   ├── 211.js                 # /211 — info organisation
    │   └── ping.js                # /ping
    ├── events/
    │   └── xpHandler.js           # Gain XP sur messageCreate
    ├── functions/
    │   ├── rankCard.js            # Générateur canvas carte de rang
    │   ├── xpUtils.js             # Calculs XP/niveaux
    │   ├── youtubeChecker.js      # Polling YouTube (5 min)
    │   └── youtubeUtils.js        # Résolution chaîne, RSS, détection live
    └── schemas/
        ├── Level.js               # XP & niveau par membre/serveur
        ├── LevelConfig.js         # Config niveaux par serveur
        └── YoutubeNotif.js        # Config notifications YouTube
```

---

## 🛠️ Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| `discord.js` | ^14 | API Discord |
| `mongoose` | latest | Base de données MongoDB |
| `@napi-rs/canvas` | latest | Rendu des cartes de rang |
| `axios` | ^1.x | Requêtes HTTP (YouTube RSS) |
| `set-interval-async` | ^3.x | Timer YouTube checker |
| `discobase-core` | ^1.x | Framework bot (auto-loader) |
| `nodemon` | dev | Rechargement auto en dev |

---

<div align="center">

**Finyzyy Bot** — Conçu pour la communauté 211 Organisation

</div>
