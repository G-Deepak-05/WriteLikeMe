chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'HUMANIZE_EMAIL') {
    handleHumanize(request.text, request.tone)
      .then((humanizedText) => sendResponse({ success: true, text: humanizedText }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function handleHumanize(text: string, tone: string): Promise<string> {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  
  if (!apiKey) {
    throw new Error('Please set your NVIDIA API key in the WriteLikeMe extension settings.');
  }

  // Define tone specific instructions
  let toneInstruction = '';
  switch (tone) {
    case 'High School':
      toneInstruction = 'Tone: Casual, colloquial, maybe a bit rushed. Use very simple words. Like a quick message to a friend.';
      break;
    case 'Friendly':
      toneInstruction = 'Tone: Warm but very conversational. Use abbreviations (e.g. "info", "sync").';
      break;
    case 'Professional':
    default:
      toneInstruction = 'Tone: Professional but blunt and to the point. No fluff.';
      break;
  }

  const systemPrompt = `You are an expert Ghostwriter. Your ONLY job is to take an AI-generated email and rewrite it so it bypasses AI detectors (like ZeroGPT, aiming for 0% AI) and looks exactly like a busy, slightly imperfect human wrote it.

CRITICAL RULES TO BYPASS AI DETECTION:
1. MAXIMIZE PERPLEXITY AND BURSTINESS. AI models write with uniform sentence structures. You MUST drastically vary sentence length. Write a long, rambling sentence, followed immediately by a short 2-4 word sentence. Mix it up completely.
2. USE LOW-PROBABILITY VOCABULARY. Avoid highly predictable word combinations (like "clean code", "optimizing performance", "reaching out"). Instead use: "code that doesn't break", "making the backend faster", "messaging you".
3. INJECT SUBTLE HUMAN QUIRKS. End a sentence with a preposition. Start sentences with 'And', 'But', or 'So'. 
4. NO JARGON OR PERFECT RHYTHM. Never use: "leverage", "delighted", "collaborating". Make the text feel slightly disjointed, exactly like someone typing quickly on a keyboard without proofreading.
5. EXTREME CONCISENESS. Humans write less. Cut out the fluff.

${toneInstruction}

Keep the original intent and facts. Do NOT invent information.
OUTPUT ONLY THE FINAL EMAIL TEXT. Do not add quotes or introductory text.`;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct", // Using a solid standard model from NVIDIA's API
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Rewrite this email:\n\n${text}` }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
