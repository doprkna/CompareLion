// apps/web/lib/ai.ts

export async function callAI(opts: { system: string; user: string; model?: string }): Promise<string> {
  // Minimal AI wrapper stub: implement using your preferred OpenAI client
  // Example:
  // const res = await openai.chat.completions.create({
  //   model: opts.model ?? 'gpt-4',
  //   temperature: 0.3,
  //   messages: [
  //     { role: 'system', content: opts.system },
  //     { role: 'user', content: opts.user },
  //   ],
  // });
  // return res.choices[0].message.content ?? '';

  throw new Error('callAI not wired');
}
