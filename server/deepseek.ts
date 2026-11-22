export const letterModel = 'deepseek-flash'

export function requestLetter(apiKey: string, messages: { role: string, content: string }[]) {
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: letterModel, messages, thinking: { type: 'disabled' },
      temperature: 0.5, max_tokens: 4096, stream: true,
    }),
  })
}
