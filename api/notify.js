// Vercel serverless function: sends a Telegram message when she taps a button.
// The bot token and chat id live in Vercel environment variables, never in the page.
const MESSAGES = {
  yes:   "✅ She tapped: Yes. The staycation is approved.",
  loud:  "🎉 She tapped: YES (but louder)!",
  tears: "😭 She tapped: Yes with tears.",
  nono:  "😂 She tapped: Yes, because she can't find no.",
  maybe: "🤔 She tapped: maybe..."
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const text = MESSAGES[body.choice];
  if (!text) return res.status(400).json({ ok: false });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ ok: false });

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    if (!r.ok) return res.status(502).json({ ok: false });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};

function safeParse(s) { try { return JSON.parse(s); } catch (e) { return {}; } }
