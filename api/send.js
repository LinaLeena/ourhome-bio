const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, secret, platform = 'telegram' } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Bad Request: message is required' });
  }

  // Simple gate — prevents open relay abuse
  const EXPECTED_SECRET = process.env.RELAY_SECRET || 'nova';
  if (secret !== EXPECTED_SECRET) {
    return res.status(403).json({ error: 'Forbidden: invalid secret' });
  }

  try {
    if (platform === 'telegram') {
      await sendTelegram(message);
      return res.status(200).json({ ok: true, platform: 'telegram', sent: true });
    }

    if (platform === 'sms') {
      return res.status(501).json({ error: 'SMS not wired yet. Use platform: "telegram"' });
    }

    return res.status(400).json({ error: 'Unknown platform. Use "telegram" or "sms"' });
  } catch (err) {
    console.error('Relay error:', err.message);
    return res.status(500).json({ error: 'Relay failed', detail: err.message });
  }
};

function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text: text.slice(0, 4096), // Telegram limit
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          const json = JSON.parse(data);
          if (!json.ok) {
            reject(new Error(json.description || 'Telegram API error'));
          } else {
            resolve(json);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
