<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=5865F2,D62828&height=200&section=header&text=Finnyzyy%20Bot&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Discord%20Bot%20%E2%80%94%20Complet%20%C2%B7%20Moderne%20%C2%B7%20Software%20Owner&descAlignY=58&descSize=16&animation=twinkling" width="100%"/>

<br/>

<a href="https://discord.js.org"><img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white"/></a>
<a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/></a>
<a href="https://mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/></a>
<a href="https://211organisation.com"><img src="https://img.shields.io/badge/211_Organisation-Partenaire-D62828?style=for-the-badge&logo=heart&logoColor=white"/></a>

<br/><br/>

<img src="https://img.shields.io/badge/Commandes-11-5865F2?style=flat-square"/>
<img src="https://img.shields.io/badge/Thèmes_de_carte-19-9c27b0?style=flat-square"/>
<img src="https://img.shields.io/badge/Fonds_welcome-8-00e676?style=flat-square"/>
<img src="https://img.shields.io/badge/Panels_tickets-25_max-ff6d00?style=flat-square"/>

<br/><br/>

> *Bot Discord complet — Niveaux V1 · Bienvenue V1 · Tickets V1 · Notifications YouTube V1 · 211 Organisation*

<br/>

</div>

---

## 📋 Sommaire

<table>
<tr>
<td>

**🚀 Démarrage**
- [Prérequis & Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Intents Discord](#intents-requis)

</td>
<td>

**🎮 Fonctionnalités**
- [Système de niveaux](#-système-de-niveaux)
- [Bienvenue custom](#-système-de-bienvenue)
- [Tickets V1](#-système-de-tickets-v1)
- [Notifications YouTube](#-notifications-youtube)

</td>
<td>

**📖 Référence**
- [Toutes les commandes](#-commandes)
- [Structure du projet](#-structure-du-projet)
- [Dépendances](#%EF%B8%8F-dépendances)
- [211 Organisation](#-211-organisation)

</td>
</tr>
</table>

---

## ✨ Vue d'ensemble

<table>
<tr>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/-🏆-1e1e2e?style=for-the-badge" /><br/>
<b>Niveaux</b><br/>
<sub>19 thèmes canvas · rôles auto · panel admin complet</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/-👋-1e1e2e?style=for-the-badge" /><br/>
<b>Bienvenue</b><br/>
<sub>8 fonds + URL custom · couleurs · auto-rôle</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/-🎫-1e1e2e?style=for-the-badge" /><br/>
<b>Tickets V1</b><br/>
<sub>25 panels · modals · transcripts · notations</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/-📺-1e1e2e?style=for-the-badge" /><br/>
<b>YouTube</b><br/>
<sub>10 chaînes · live/vidéo · sans API key</sub>
</td>
</tr>
</table>

---

## 🚀 Installation

```bash
# 1. Cloner le repo
git clone https://github.com/votre-username/finnyzyy-bot.git
cd finnyzyy-bot

# 2. Installer les dépendances
npm install

# 3. Configurer le bot (voir section Configuration)
cp config.example.json config.json
nano config.json

# 4. Lancer en production
npm start

# Lancer en développement (rechargement automatique)
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
    "mongodbUrl": "mongodb+srv://user:pass@cluster.mongodb.net/finyzyy"
  },
  "logging": {
    "guildJoinLogsId": "ID_SALON",
    "guildLeaveLogsId": "ID_SALON",
    "commandLogsChannelId": "ID_SALON",
    "errorLogs": "WEBHOOK_URL"
  },
  "prefix": { "value": "!" }
}
```

### Intents requis

Activez ces intents sur le [Portail Développeur Discord](https://discord.com/developers/applications) :

| Intent | Obligatoire | Usage |
|--------|:-----------:|-------|
| `SERVER MEMBERS INTENT` | ✅ | Bienvenues, rôles auto |
| `MESSAGE CONTENT INTENT` | ✅ | Gain XP, commandes préfixées |
| `PRESENCE INTENT` | ✅ | Statut bot |

---

## 📖 Commandes

### 🏆 Niveaux

| Commande | Description | Permission |
|----------|-------------|:----------:|
| `/rank [@user]` | Affiche la carte de rang d'un membre | Tous |
| `/levelsetup` | Panel de configuration complet | `Gérer le serveur` |
| `/setlevel @user <niveau>` | Définit le niveau d'un membre | `Gérer le serveur` |

### 👋 Bienvenue

| Commande | Description | Permission |
|----------|-------------|:----------:|
| `/welcomesetup` | Configure le système de bienvenue | `Gérer le serveur` |

### 🎫 Tickets

| Commande | Description | Permission |
|----------|-------------|:----------:|
| `/ticketsetup` | Panel de configuration des tickets | `Gérer le serveur` |

### 📺 YouTube

| Commande | Description | Permission |
|----------|-------------|:----------:|
| `/ytbnotif setup` | Ajouter une chaîne à surveiller | `Gérer le serveur` |
| `/ytbnotif list` | Lister les chaînes surveillées | `Gérer le serveur` |
| `/ytbnotif remove` | Supprimer une notification | `Gérer le serveur` |

### 🔧 Général

| Commande | Description |
|----------|-------------|
| `/ping` | Latence du bot |
| `/211` | Informations sur la 211 Organisation |
| `/finnyzyy` | Présentation de Finnyzyy |
| `/clear <nombre>` | Supprimer des messages |

---

## 🏆 Système de niveaux

### Formule XP

```
XP gagné    =  xpPerMessage ± variance  (configurable)
XP requis N =  5 × N² + 50 × N + 100
```

<details>
<summary><b>📊 Tableau des paliers (cliquer pour développer)</b></summary>

| Niveau | XP requis |
|--------|-----------|
| 0 → 1  | 100 XP |
| 9 → 10 | 1 040 XP |
| 24 → 25 | 3 600 XP |
| 49 → 50 | 13 100 XP |
| 99 → 100 | 50 100 XP |
| 999 → 1000 | ~5 000 000 XP |

</details>

### 🎨 19 Thèmes de carte

Les thèmes changent **automatiquement** selon le niveau. Chaque thème a sa propre palette de couleurs, fond dégradé, glow et ring d'avatar.

| Niveaux | Thème | Couleur |
|---------|-------|---------|
| `0 – 9` | **NOVICE** | ![#3d7aff](https://img.shields.io/badge/-Bleu_nuit-3d7aff?style=flat-square) |
| `10 – 24` | **ADEPT** | ![#00e676](https://img.shields.io/badge/-Vert_émeraude-00e676?style=flat-square) |
| `25 – 49` | **EXPERT** | ![#ce93d8](https://img.shields.io/badge/-Violet_cristal-ce93d8?style=flat-square) |
| `50 – 74` | **ÉLITE** | ![#ff6d00](https://img.shields.io/badge/-Orange_feu-ff6d00?style=flat-square) |
| `75 – 99` | **LÉGENDE** | ![#00e5ff](https://img.shields.io/badge/-Cyan_plasma-00e5ff?style=flat-square) |
| `100 – 149` | **SHINIGAMI** | ![#e53935](https://img.shields.io/badge/-Rouge_sang-e53935?style=flat-square) |
| `150 – 199` | **SHINIGAMI CONFIRMÉ** | ![#ff6659](https://img.shields.io/badge/-Rouge_ivoire-ff6659?style=flat-square) |
| `200 – 249` | **EXÉCUTEUR** | ![#9c27b0](https://img.shields.io/badge/-Violet_sombre-9c27b0?style=flat-square) |
| `250 – 299` | **STRATÈGE** | ![#4fc3f7](https://img.shields.io/badge/-Bleu_acier-4fc3f7?style=flat-square) |
| `300 – 349` | **AUTORITÉ OCCULTE** | ![#bdbdbd](https://img.shields.io/badge/-Gris_anthracite-bdbdbd?style=flat-square) |
| `350 – 399` | **VOIX DE LA JUSTICE** | ![#ffc107](https://img.shields.io/badge/-Bleu_royal_%26_or-ffc107?style=flat-square) |
| `400 – 449` | **ARCHITECTE** | ![#ff8f00](https://img.shields.io/badge/-Bronze_chaud-ff8f00?style=flat-square) |
| `450 – 499` | **MAIN INVISIBLE** | ![#f48fb1](https://img.shields.io/badge/-Rose_poudré-f48fb1?style=flat-square) |
| `500 – 599` | **DOMINATEUR** | ![#e040fb](https://img.shields.io/badge/-Magenta_intense-e040fb?style=flat-square) |
| `600 – 699` | **SYMBOLE** | ![#ffb300](https://img.shields.io/badge/-Ambre_antique-ffb300?style=flat-square) |
| `700 – 799` | **VOLONTÉ ABSOLUE** | ![#ff1744](https://img.shields.io/badge/-Rouge_carmin-ff1744?style=flat-square) |
| `800 – 899` | **ORDRE** | ![#eceff1](https://img.shields.io/badge/-Blanc_glacial-eceff1?style=flat-square) |
| `900 – 999` | **LOI** | ![#ffd54f](https://img.shields.io/badge/-Or_divin-ffd54f?style=flat-square) |
| `1000+` | **NOUVEAU MONDE** | ![#ffffff](https://img.shields.io/badge/-Or_blanc_absolu-ffffff?style=flat-square&labelColor=ffd600) |

### Panel `/levelsetup` — Configuration

```
⚡ Système XP     →  XP/message · variance · cooldown
🎉 Level-Up       →  activer · salon dédié · message custom {user} {level}
🎭 Rôles          →  niveau requis · rôle · couleur hex · label carte
🚫 Ignorer        →  salons ou rôles exclus du gain XP
♻️ Reset          →  réinitialise toute la config
```

---

## 👋 Système de bienvenue

Card de bienvenue **générée en canvas** à chaque arrivée. Entièrement configurable via `/welcomesetup`.

### 8 Fonds prédéfinis

| Preset | Style | Accent |
|--------|-------|--------|
| `discord` | Bleu nuit + orbes | ![#5865F2](https://img.shields.io/badge/-5865F2-5865F2?style=flat-square) |
| `dark` | Noir & Or + grille | ![#f1c40f](https://img.shields.io/badge/-f1c40f-f1c40f?style=flat-square) |
| `ocean` | Bleu profond + vagues | ![#00b4ff](https://img.shields.io/badge/-00b4ff-00b4ff?style=flat-square) |
| `forest` | Vert forêt | ![#00e676](https://img.shields.io/badge/-00e676-00e676?style=flat-square) |
| `galaxy` | Fond étoilé + nébuleuses | ![#c471ed](https://img.shields.io/badge/-c471ed-c471ed?style=flat-square) |
| `sunset` | Coucher de soleil | ![#ff6b35](https://img.shields.io/badge/-ff6b35-ff6b35?style=flat-square) |
| `midnight` | Minuit étoilé | ![#00c6ff](https://img.shields.io/badge/-00c6ff-00c6ff?style=flat-square) |
| `crimson` | Rouge sang + grille | ![#e53935](https://img.shields.io/badge/-e53935-e53935?style=flat-square) |
| `custom` | **URL personnalisée** | 🎨 Libre |

### Ce qu'on peut configurer

```
🌅 Fond           →  8 presets ou URL image custom
🎨 Couleurs       →  accent · texte · overlay · bordure avatar
✏️ Textes         →  titre · sous-titre · message texte
📢 Salon          →  salon d'envoi
🎭 Auto-rôle      →  rôle attribué à chaque arrivée
👁️ Prévisualiser  →  génère la card avec ton avatar en temps réel
```

### Variables du message

| Variable | Valeur |
|----------|--------|
| `{user}` | Mention Discord |
| `{username}` | Nom du membre |
| `{server}` | Nom du serveur |
| `{count}` | Numéro du membre |

---

## 🎫 Système de Tickets V1

### Architecture

```
TicketConfig  ──  Configuration par serveur (panels, options globales)
Ticket        ──  Chaque ticket ouvert (état · claim · notation · transcript)
ticketInteraction  ──  Event interceptant tous les boutons/modals en temps réel
```

### Flux d'un ticket

```
👤 Membre clique sur un bouton de panel
         │
         ▼
   ┌─────────────────┐
   │  Modal activé ? │──── OUI ──→ Formulaire (1-5 champs) → réponses en DB
   └─────────────────┘
         │ NON
         ▼
   Salon créé dans la catégorie configurée
   Permissions : @everyone ❌ · Membre ✅ · Staff ✅
         │
         ▼
   Embed de bienvenue + boutons staff envoyés
   Rôles pingés notifiés
         │
         ▼
   Staff :  ⚡ Claim  ·  ➕ Ajouter membre  ·  📋 Transcript
         │
         ▼
   🔒 Fermeture → modal raison → transcript .txt généré
   DM envoyé au membre · Salon supprimé après délai
         │
         ▼
   ⭐ DM de notation (1-5 étoiles) → sauvegardé en DB
```

### Panel `/ticketsetup`

| Bouton | Action |
|--------|--------|
| 🟢/🔴 Activer/Désactiver | Toggle global |
| ⚙️ Config globale | Logs · transcripts · DM · délais · notation |
| ➕ Nouveau panel | Créer un panel 100% custom (modal 5 champs) |
| 📦 Panels prédéfinis | Ajouter en 1 clic |
| ✏️ Éditer panel | Éditeur complet d'un panel existant |
| 🗑️ Supprimer panel | Suppression avec confirmation |
| 📤 Publier | Envoyer l'embed dans un salon |
| ♻️ Reset | Réinitialisation complète |

### 5 Panels prédéfinis

| Panel | Emoji | Style | Modal |
|-------|:-----:|-------|:-----:|
| Support | 🛠️ | Bleu | ❌ |
| Recrutement | 📋 | Vert | ✅ 3 champs |
| Signalement | 🚨 | Rouge | ✅ 2 champs |
| Partenariat | 🤝 | Gris | ✅ 3 champs |
| Commande / Achat | 🛒 | Vert | ❌ |

### Variables disponibles

| Variable | Disponible dans | Valeur |
|----------|----------------|--------|
| `{user}` | Message bienvenue | Mention |
| `{username}` | Message · nom salon | Pseudo |
| `{ticketNumber}` | Message · nom salon | `0042` |
| `{panel}` | Nom salon | ID du panel |

<details>
<summary><b>📂 Exemples de format de nom de salon</b></summary>

| Format | Résultat |
|--------|----------|
| `ticket-{username}` | `ticket-finyzyy` |
| `support-{ticketNumber}` | `support-0042` |
| `{panel}-{username}` | `recrutement-finyzyy` |
| `🎫-{ticketNumber}` | `🎫-0042` |

</details>

---

## 📺 Notifications YouTube

Surveillance de **jusqu'à 10 chaînes** par serveur via flux RSS public — **sans clé API**.

### Fonctionnement

```
⏱️ Vérification toutes les 5 minutes
📡 RSS public YouTube (pas de quota, pas de clé API)
🔍 Détection automatique : live 🔴 ou vidéo 🎬
📣 Mention rôle ou @everyone configurable
```

### Variables du message

| Variable | Valeur |
|----------|--------|
| `{channelName}` | Nom de la chaîne YouTube |
| `{videoTitle}` | Titre de la vidéo/live |
| `{videoUrl}` | Lien direct |

### Formats d'URL acceptés

```
https://youtube.com/@NomDeLaChaine
https://youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
UCxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📁 Structure du projet

```
~Finyzyy/
├── 📄 config.json
├── 📄 package.json
└── 📂 src/
    ├── 📄 index.js
    │
    ├── 📂 commands/Community/
    │   ├── 🔧 ping.js
    │   ├── 🛡️  211.js
    │   ├── 🎙️  finyzyy.js
    │   ├── 🗑️  clear.js
    │   ├── 🏆 rank.js                 # /rank — carte de rang
    │   ├── ⚙️  levelsetup.js           # /levelsetup — panel admin niveaux
    │   ├── 🎚️  setlevel.js             # /setlevel — modifier le niveau d'un membre
    │   ├── 👋 welcomesetup.js         # /welcomesetup — panel bienvenue
    │   ├── 🎫 ticketsetup.js          # /ticketsetup — panel admin tickets
    │   └── 📺 ytbnotif.js             # /ytbnotif — notifications YouTube
    │
    ├── 📂 events/
    │   ├── ⚡ xpHandler.js            # Gain XP sur messageCreate
    │   ├── 👋 guildMemberAdd.js       # Envoi card de bienvenue
    │   └── 🎫 ticketInteraction.js    # Handler boutons/modals tickets
    │
    ├── 📂 functions/
    │   ├── 🎨 rankCard.js             # Génération canvas carte de rang
    │   ├── 🖼️  welcomeCard.js          # Génération canvas carte de bienvenue
    │   ├── 🧮 xpUtils.js              # Calculs XP / niveaux
    │   ├── 🎫 ticketHandler.js        # Logique open/close/claim/rate
    │   ├── 🛠️  ticketUtils.js          # Embeds, permissions, transcript
    │   ├── 📡 youtubeChecker.js       # Timer RSS YouTube
    │   └── 🔗 youtubeUtils.js         # Parsing RSS / extraction ID
    │
    └── 📂 schemas/
        ├── 📊 Level.js                # XP & niveau par membre
        ├── ⚙️  LevelConfig.js          # Config niveaux par serveur
        ├── 👋 WelcomeConfig.js        # Config bienvenue par serveur
        ├── 🎫 Ticket.js               # Instance de ticket
        ├── 🗂️  TicketConfig.js         # Config tickets par serveur
        └── 📺 YoutubeNotif.js         # Config YouTube par serveur
```

---

## 🛠️ Dépendances

| Package | Version | Usage |
|---------|---------|-------|
| `discord.js` | `^14.26` | API Discord |
| `mongoose` | `^9.4` | Base de données MongoDB |
| `@napi-rs/canvas` | `^0.1.98` | Rendu canvas (cartes rang & bienvenue) |
| `axios` | `^1.15` | Requêtes HTTP (YouTube RSS) |
| `set-interval-async` | `^3.x` | Timer YouTube checker |
| `discobase-core` | `^1.0.3` | Framework bot (auto-loader commandes/events) |
| `express` | `^5.x` | Dashboard admin intégré |
| `nodemon` | dev | Rechargement auto en développement |

---

## 🛡️ 211 Organisation

<div align="center">

<img src="https://img.shields.io/badge/211_Organisation-Protection_de_l'enfance-D62828?style=for-the-badge&logo=shield&logoColor=white"/>

</div>

Ce bot est développé en soutien à la **211 Organisation**, association de protection de l'enfance et de lutte contre la pédocriminalité en ligne.

> 🌐 [211organisation.com](https://211organisation.com) · 💜 [Faire un don](https://www.helloasso.com/associations/211-organisation/formulaires/1)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=5865F2,D62828&height=100&section=footer" width="100%"/>

<sub>**Finnyzyy Bot** — Conçu pour la communauté · Propulsé par <a href="https://discord.js.org">discord.js v14</a> & <a href="https://211organisation.com">211 Organisation</a></sub>

</div>
