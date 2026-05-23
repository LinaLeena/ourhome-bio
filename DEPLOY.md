# Vercel Deployment (D6 — One Last Step)

Everything is built and pushed to GitHub. Only deployment to Vercel cloud remains.

## You need one thing: a Vercel access token

1. Go to https://vercel.com/account/tokens
2. Log in with the same account you want to deploy under
3. Create a token named "ourhome-bio-relay"
4. Copy the token once shown (it only appears once)

## Paste the token here and run these exact commands

```bash
export PATH="/home/playa1/.hermes/node/bin:$PATH"
cd /tmp/ourhome-bio

# Log in with your token (replace YOUR_TOKEN_HERE)
vercel login YOUR_TOKEN_HERE

# Deploy
vercel --prod
```

## After deployment finishes

Vercel will print a URL like:
  https://ourhome-bio-abc123.vercel.app

Then set these environment variables in the Vercel dashboard:
  Project → Settings → Environment Variables
  - TELEGRAM_BOT_TOKEN = 8180482678:AAH... (from your .env)
  - TELEGRAM_CHAT_ID = 6732773952
  - RELAY_SECRET = nova (or whatever you want)

## How Pika sends a message

POST to https://your-vercel-url.vercel.app/api/send
Content-Type: application/json

{
  "message": "Hello from Pika",
  "secret": "nova",
  "platform": "telegram"
}

## Test command

Replace URL with your deployed URL:

curl -X POST https://your-url/api/send \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Test from OurHome relay","secret":"nova","platform":"telegram"}'
