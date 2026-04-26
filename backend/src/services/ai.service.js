const Product = require('../models/Product');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are the Maison Tempus Concierge — a refined, knowledgeable AI sales associate at a luxury watch boutique.
Your tone is warm, succinct, and confident, never pushy. Avoid emojis and exclamation marks.
Reply in 1-3 short paragraphs (under 120 words), or a tight bulleted list when comparing 2-3 watches.

You help shoppers:
- Choose the right watch by occasion, style, budget, movement, brand, or case size
- Understand horological terms (automatic vs. quartz, complications, water resistance)
- Compare specific pieces from THIS boutique's catalogue

Rules:
- ONLY recommend watches that appear in the provided catalogue context. Never invent products.
- When recommending a piece, write its exact name as shown in the catalogue, on its own short line, prefixed with the marker [PICK] so the UI can link it. Example: "[PICK] Nocturne Skeleton".
- If a customer's need cannot be met from the catalogue, say so honestly and suggest the closest alternative.
- For pricing, quote the price shown in the catalogue in USD.
- Do not promise discounts, custom orders, or shipping times.`;

function buildCatalogueContext(products) {
  if (!products || products.length === 0) return 'Catalogue is currently empty.';
  const lines = products.slice(0, 30).map((p) => {
    const price = `$${Math.round(p.price).toLocaleString('en-US')}`;
    return `- ${p.name} | ${p.brand} | ${p.category} | ${p.movement} | ${p.caseMaterial} ${p.caseSize} | WR ${p.waterResistance} | ${price} | stock ${p.stock}`;
  });
  return `CATALOGUE (${products.length} watches available):\n${lines.join('\n')}`;
}

async function loadCatalogue() {
  const products = await Product.find({}, 'name brand category movement caseMaterial caseSize waterResistance price stock featured').lean();
  return products;
}

async function chatWithConcierge({ messages }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('AI concierge is not configured.');
    err.status = 503;
    throw err;
  }

  const products = await loadCatalogue();
  const catalogue = buildCatalogueContext(products);

  const fullMessages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${catalogue}` },
    ...messages.slice(-10),
  ];

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: fullMessages,
      temperature: 0.5,
      max_tokens: 400,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const err = new Error(`Groq API error (${response.status}): ${text.slice(0, 200)}`);
    err.status = response.status >= 500 ? 502 : 502;
    throw err;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim() || '';

  const productNames = new Set(products.map((p) => p.name.toLowerCase()));
  const picks = [];
  const pickRegex = /\[PICK\]\s*([^\n]+)/g;
  let match;
  while ((match = pickRegex.exec(content)) !== null) {
    const name = match[1].trim().replace(/[.,;:]+$/, '');
    if (productNames.has(name.toLowerCase())) {
      const product = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (product && !picks.find((p) => p._id.toString() === product._id.toString())) {
        picks.push({
          _id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
        });
      }
    }
  }

  const cleaned = content.replace(/\[PICK\]\s*/g, '').trim();

  return { reply: cleaned, picks };
}

module.exports = { chatWithConcierge };
