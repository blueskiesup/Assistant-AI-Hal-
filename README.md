# Greg's Personal Agent — Private Setup Guide

A secure, private AI assistant with Gmail, Google Calendar, and web search.
Hosted on GitHub Pages (private) + Cloudflare Workers (API proxy).

---

## Architecture

```
Your Browser (iPhone / Mac)
        │
        │  HTTPS + secret token
        ▼
Cloudflare Worker  ←── your secrets live here (never in browser)
        │
        │  Anthropic API key (server-side only)
        ▼
Anthropic API  ←── Gmail MCP + Calendar MCP + Web Search
```

Your API key never touches the browser. The Cloudflare Worker is the only
place it lives, and access is gated by a secret token only you know.

---

## Step 1 — Create a Private GitHub Repo

1. Go to https://github.com/new
2. Repository name: `my-agent` (or anything you like)
3. Set visibility to **Private**
4. Click **Create repository**
5. Upload `index.html` and `worker.js` from this folder to the repo

---

## Step 2 — Enable GitHub Pages

1. In your repo, go to **Settings → Pages**
2. Under "Source", select **Deploy from a branch**
3. Branch: `main` | Folder: `/ (root)`
4. Click **Save**

> **Important:** GitHub Pages on private repos requires a paid GitHub plan
> (GitHub Pro ~$4/mo or Team). If you don't want to pay, use Netlify instead
> (see Alternative Hosting below).

Your agent will be live at:
`https://YOUR_GITHUB_USERNAME.github.io/my-agent/`

---

## Step 3 — Deploy the Cloudflare Worker

This is the secure API proxy that keeps your keys off the client.

### 3a. Create a Cloudflare account
Sign up free at https://cloudflare.com

### 3b. Create the Worker
1. Go to **Workers & Pages → Create**
2. Choose **Create Worker**
3. Name it something like `greg-agent-proxy`
4. Click **Deploy**, then **Edit code**
5. Paste the contents of `worker.js` into the editor
6. Click **Deploy**

Your Worker URL will be:
`https://greg-agent-proxy.YOUR_SUBDOMAIN.workers.dev`

### 3c. Add secrets (this is where your keys live securely)
In your Worker dashboard → **Settings → Variables → Secret variables**

Add these two secrets:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from https://console.anthropic.com |
| `AGENT_TOKEN` | A strong random password you make up — e.g. `greg-agent-xK9mP2qR7` |

> The AGENT_TOKEN is like a password for your agent. Without it, no one else
> can use your Worker even if they find the URL.

---

## Step 4 — Update index.html with your URLs

Open `index.html` and update the CONFIG block near the top:

```javascript
const CONFIG = {
  WORKER_URL: 'https://greg-agent-proxy.YOUR_SUBDOMAIN.workers.dev',
  AGENT_TOKEN: 'greg-agent-xK9mP2qR7',   // same value you put in Worker secrets
  MCP_GMAIL: 'https://gmail.mcp.claude.com/mcp',
  MCP_GCAL:  'https://gcal.mcp.claude.com/mcp',
};
```

Commit and push the updated file to GitHub.

---

## Step 5 — Lock Down the Worker (Optional but Recommended)

Once you know your GitHub Pages URL, restrict the Worker to only accept
requests from that origin.

In `worker.js`, change:
```javascript
const ALLOWED_ORIGIN = '*';
```
To:
```javascript
const ALLOWED_ORIGIN = 'https://YOUR_GITHUB_USERNAME.github.io';
```

Redeploy the Worker after this change.

---

## Step 6 — Add to Home Screen on iPhone

1. Open Safari on iPhone
2. Go to your GitHub Pages URL
3. Tap the **Share** button (box with arrow)
4. Scroll down and tap **Add to Home Screen**
5. Name it "Greg's Agent"
6. Tap **Add**

It'll appear on your home screen and open full-screen like a native app.

---

## Step 7 — Gmail & Calendar OAuth

The Gmail and Google Calendar MCP connections require OAuth authentication
through Anthropic's MCP servers. Since these MCP servers currently authenticate
through Claude.ai sessions, you have two options:

**Option A (Easiest):** Keep using the agent within Claude.ai for Gmail/Calendar
features, and use the hosted version for everything else.

**Option B (Full standalone):** Set up your own Google OAuth app:
1. Go to https://console.cloud.google.com
2. Create a project → Enable Gmail API + Google Calendar API
3. Create OAuth 2.0 credentials
4. Implement the OAuth flow in your Worker

This is more involved — start with Option A and upgrade later if needed.

---

## Alternative Hosting: Netlify (No Paid Plan Needed)

If you don't want to pay for GitHub Pro:

1. Go to https://app.netlify.com/drop
2. Drag your `index.html` file into the drop zone
3. You get a URL like `https://amazing-name-123.netlify.app`
4. Go to **Site settings → Build & deploy → Environment** to add a password

Or use Netlify's Identity feature for proper login protection.

---

## Security Summary

| What | Where | Who can access |
|------|-------|----------------|
| Anthropic API key | Cloudflare Worker secrets | Only you (never in browser) |
| Agent token | Cloudflare Worker secrets + your CONFIG | Only you |
| Conversation history | Your browser memory only | Only you (not stored anywhere) |
| GitHub repo | Private | Only you |
| GitHub Pages URL | Obscure but technically public | Anyone with the URL — lock with Netlify password if concerned |

---

## Files in This Repo

- `index.html` — the agent UI (update CONFIG before deploying)
- `worker.js` — the Cloudflare Worker proxy (deploy to Cloudflare)
- `README.md` — this guide
