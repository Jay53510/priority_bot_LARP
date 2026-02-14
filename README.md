# Los Angeles Roleplay Priority Bot

Production-ready Discord bot (Node.js + `discord.js` v14) for a server-wide Priority System.

## Commands (Prefix: `$`)
- `$startpriority`
- `$endpriority`
- `$prioritystatus`

## Behavior
- Starts one global priority for 40 minutes.
- If manually ended or auto-expired, starts a 20-minute cooldown.
- Blocks new priorities while active or cooling down.
- Uses embeds for all system responses.

---

## Step-by-step setup

### 1) Create the Discord bot application
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**.
3. Open **Bot** tab and click **Add Bot**.
4. Copy your bot token.

### 2) Enable required bot settings
In **Bot** settings:
- Enable **Message Content Intent**.
- (Recommended) Enable **Server Members Intent** only if needed in the future.

### 3) Invite bot to your server
1. In **OAuth2 > URL Generator**, select:
   - `bot` scope
2. Bot permissions (minimum):
   - Send Messages
   - Embed Links
   - Read Message History
   - View Channels
3. Use generated URL to invite bot.

### 4) Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env`:
```env
DISCORD_TOKEN=your_bot_token_here
```

### 5) Install dependencies and run
```bash
npm install
npm start
```

---

## How to run this bot 24/7

### Option A (Easy VPS method): PM2
Use this if you have a VPS (Ubuntu, Debian, etc.).

1. Install Node.js LTS and npm.
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Start bot with PM2:
   ```bash
   pm2 start index.js --name larp-priority-bot
   ```
4. Save process list:
   ```bash
   pm2 save
   ```
5. Enable startup on reboot:
   ```bash
   pm2 startup
   ```
   Run the command PM2 prints afterward.
6. Monitor logs:
   ```bash
   pm2 logs larp-priority-bot
   ```

### Option B (Cloud platforms)
Deploy on Railway, Render, Fly.io, or a Docker host.
- Add `DISCORD_TOKEN` as an environment variable in the platform dashboard.
- Set start command: `npm start`.

> Note: This bot uses in-memory state. If the process restarts, current priority/cooldown state resets.

---

## Project structure
```
.
├── index.js
├── package.json
├── .env.example
└── src
    ├── constants.js
    ├── embedFactory.js
    └── priorityManager.js
```
