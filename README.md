<div align="center">

# 🤖 Finyzyy Bot

**Bot Discord complet — Niveaux avancés · Notifications YouTube · Système de Tickets V1**

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
- [Système de Tickets V1](#-système-de-tickets-v1)
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
- Classement `/rank` et leaderboard
- Panel admin `/levelsetup` complet et interactif

### 📺 Notifications YouTube
- Surveillance de plusieurs chaînes YouTube (max 10 par serveur)
- **Détection automatique live/vidéo** : messages distincts selon le type
- Setup en 4 étapes avec menus interactifs
- Mention de rôle ou @everyone configurable
- Message personnalisable avec variables
- Vérification toutes les 5 minutes via flux RSS (sans clé API)

### 🎫 Système de Tickets V1
- **Panels multi-boutons** : jusqu'à 25 panels différents par serveur
- **5 panels prédéfinis** : Support, Recrutement, Signalement, Partenariat, Commande
- **Formulaires modals** : chaque panel peut avoir jusqu'à 5 champs de questions
- **Claim system** : les staffs peuvent s'assigner un ticket
- **Transcripts automatiques** : fichier .txt généré à la fermeture
- **Système de notation** : les utilisateurs notent leur expérience en DM (⭐ 1-5)
- **DM de fermeture** : notification automatique en DM à l'utilisateur
- **Logs complets** : chaque action loguée dans un salon dédié
- **Ajout de membres** : le staff peut ajouter des membres manuellement
- **Panel admin `/ticketsetup`** : configuration complète en interface interactive

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

# 4. Configurer le bot
nano config.json

# 5. Lancer le bot
npm start

# Développement (rechargement automatique)
npm run dev
```

---

## ⚙️ Configuration

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
| `/rank [@user]` | Affiche la carte de rang | Tous |
| `/levelsetup` | Panel de configuration des niveaux | `Gérer le serveur` |

### 📺 YouTube

| Commande | Description | Permission |
|----------|-------------|------------|
| `/ytbnotif setup` | Configurer une nouvelle notification | `Gérer le serveur` |
| `/ytbnotif list` | Voir toutes les chaînes surveillées | `Gérer le serveur` |
| `/ytbnotif remove` | Supprimer une notification | `Gérer le serveur` |

### 🎫 Tickets

| Commande | Description | Permission |
|----------|-------------|------------|
| `/ticketsetup` | Ouvre le panel de configuration tickets | `Gérer le serveur` |

### 🔧 Général

| Commande | Description |
|----------|-------------|
| `/ping` | Latence du bot |
| `/211` | Informations sur la 211 Organisation |

---

## 🎮 Système de niveaux

### Formule XP
```
XP gagné = xpPerMessage ± variance (aléatoire)
XP requis niveau N = 5 × N² + 50 × N + 100
```

| Niveau | XP requis pour passer |
|--------|----------------------|
| 0 → 1  | 100 XP |
| 9 → 10 | 1 040 XP |
| 24 → 25 | 3 600 XP |
| 49 → 50 | 13 100 XP |
| 99 → 100 | 50 100 XP |

### Panel `/levelsetup` — ce qu'on peut configurer

- **⚡ Système XP** : XP/message, variance, cooldown
- **🎉 Level-Up** : activer/désactiver, salon dédié, message custom (`{user}`, `{level}`)
- **🎭 Récompenses rôles** : niveau requis, rôle attribué, couleur hex, label carte
- **🚫 Ignorer** : salons ou rôles exclus du gain XP

### Thèmes de carte (18 paliers)

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
Vérification toutes les **5 minutes** via RSS public (sans clé API).

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
UCxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🎫 Système de Tickets V1

### Architecture

Le système repose sur **3 couches** :

1. **`TicketConfig`** — configuration par serveur (panels, options globales)
2. **`Ticket`** — chaque ticket ouvert (état, claim, notation, transcript)
3. **`ticketInteraction`** event — intercepte tous les boutons/modals en temps réel

---

### Panel admin `/ticketsetup`

Interface complète avec 2 rangées de boutons :

#### Rangée 1
| Bouton | Action |
|--------|--------|
| 🟢/🔴 Activer/Désactiver | Toggle global du système |
| ⚙️ Config globale | Salons logs/transcripts, DM, delays, notation |
| ➕ Nouveau panel | Créer un panel custom (modal 5 champs) |
| 📦 Panels prédéfinis | Ajouter en 1 clic des panels préconfigurés |

#### Rangée 2
| Bouton | Action |
|--------|--------|
| ✏️ Éditer panel | Modifier un panel existant (éditeur complet) |
| 🗑️ Supprimer panel | Supprimer avec confirmation |
| 📤 Publier le panel | Envoyer/mettre à jour l'embed dans un salon |
| ♻️ Reset total | Réinitialiser toute la config |

---

### Config globale

| Option | Description | Défaut |
|--------|-------------|--------|
| Salon de logs | Où loguer les actions tickets | Non défini |
| Salon de transcripts | Où envoyer les fichiers .txt | Non défini |
| DM à la fermeture | Notifier l'utilisateur en DM | ✅ Oui |
| Transcript automatique | Générer le .txt à chaque fermeture | ✅ Oui |
| Système de notation | Demander une note en DM après fermeture | ✅ Oui |
| Délai de suppression | Secondes avant suppression du salon | 5s |
| Titre du panel | Titre de l'embed principal | 🎫 Support & Tickets |

---

### Éditeur de panel

Pour chaque panel, on peut configurer :

| Section | Paramètres |
|---------|-----------|
| 📝 Texte & Style | Label, emoji, description, message bienvenue, couleur hex |
| 👥 Staff & Pings | Rôles staff (accès), rôles pingés à l'ouverture |
| 📂 Catégorie | Catégorie Discord où créer les salons tickets |
| 📋 Modal | Activer/désactiver, titre, jusqu'à 5 champs personnalisés |
| ⚙️ Paramètres | Max tickets par membre, format nom salon, style du bouton |

---

### Panels prédéfinis (5 inclus)

| Panel | Emoji | Style | Modal |
|-------|-------|-------|-------|
| Support | 🛠️ | Primary (bleu) | ❌ |
| Recrutement | 📋 | Success (vert) | ✅ 3 champs (âge, expérience, motivation) |
| Signalement | 🚨 | Danger (rouge) | ✅ 2 champs (suspect, raison) |
| Partenariat | 🤝 | Secondary | ✅ 3 champs (serveur, membres, offre) |
| Commande / Achat | 🛒 | Success (vert) | ❌ |

---

### Fonctionnement d'un ticket

```
Utilisateur clique sur un bouton
         ↓
   [Si modal activé]
   Formulaire s'ouvre → réponses sauvegardées en DB
         ↓
   Salon créé dans la catégorie configurée
   Permissions set : @everyone ❌ | user ✅ | staff ✅
         ↓
   Embed de bienvenue + boutons de contrôle envoyés
   Rôles pingés notifiés
         ↓
   Staff : Claim ⚡ / Ajouter membre ➕ / Transcript 📋
         ↓
   Fermeture 🔒 → modal raison → transcript .txt généré
   DM envoyé à l'utilisateur
   Salon supprimé après délai
         ↓
   DM de notation envoyé (⭐ 1-5) → log en DB
```

---

### Variables disponibles

| Variable | Disponibilité | Valeur |
|----------|--------------|--------|
| `{user}` | Message bienvenue | Mention Discord |
| `{username}` | Message bienvenue, nom salon | Nom sans discriminant |
| `{ticketNumber}` | Message bienvenue, nom salon | `0042` (paddé 4 chiffres) |
| `{panel}` | Nom salon | ID du panel |

---

### Format nom de salon — exemples

| Format | Résultat |
|--------|----------|
| `ticket-{username}` | `ticket-finyzyy` |
| `support-{ticketNumber}` | `support-0042` |
| `{panel}-{username}` | `recrutement-finyzyy` |
| `🎫-{ticketNumber}` | `🎫-0042` |

---

## 📁 Structure du projet

```
~Finyzyy/
├── config.json
├── package.json
└── src/
    ├── index.js
    ├── commands/Community/
    │   ├── ping.js
    │   ├── 211.js
    │   ├── rank.js                    # /rank
    │   ├── levelsetup.js              # /levelsetup — panel admin niveaux
    │   ├── ytbnotif.js                # /ytbnotif — notifications YouTube
    │   └── ticketsetup.js             # /ticketsetup — panel admin tickets ✨ NEW
    ├── events/
    │   ├── xpHandler.js               # Gain XP sur messageCreate
    │   └── ticketInteraction.js       # Handler boutons/modals tickets ✨ NEW
    ├── functions/
    │   ├── rankCard.js
    │   ├── xpUtils.js
    │   ├── youtubeChecker.js
    │   ├── youtubeUtils.js
    │   ├── ticketUtils.js             # Embeds, permissions, transcript ✨ NEW
    │   └── ticketHandler.js           # Logique open/close/claim/rate ✨ NEW
    └── schemas/
        ├── Level.js
        ├── LevelConfig.js
        ├── YoutubeNotif.js
        ├── TicketConfig.js            # Config tickets par serveur ✨ NEW
        └── Ticket.js                  # Instance de ticket ✨ NEW
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
