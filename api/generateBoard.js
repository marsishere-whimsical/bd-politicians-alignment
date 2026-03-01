import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BoardSchema = z.object({
  sandwichesOnBoard: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number()
  })),
  axisLabels: z.object({
    top: z.literal("Good"),
    bottom: z.literal("Evil"),
    left: z.literal("Lawful"),
    right: z.literal("Chaotic")
  }),
  note: z.literal("AI Generated Board"),
  source: z.literal("ai-generated")
});

function shuffleSandwiches(sandwiches) {
  return [...sandwiches].sort(() => Math.random() - 0.5);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sandwichData = JSON.parse(
      readFileSync(join(__dirname, '../src/data/sandwiches.json'), 'utf8')
    );

    // Shuffle the sandwich IDs
    const shuffledSandwiches = shuffleSandwiches(sandwichData.sandwiches);


    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: "You are an expert in generating realistic synthetic data. Generate positions for sandwiches on a chart where X coordinates represent Lawful (-1) to Chaotic (1) and Y coordinates represent Good (1) to Evil (-1). Coordinates should go to 3 decimal places."
          },
          {
            role: "user",
            content: `Generate board data. How many entries? Generate 10 to 35 entries - a number within that range. Use sandwich IDs from this list: ${shuffledSandwiches.map(s => s.id).join(', ')}.`
          }
        ],
        response_format: zodResponseFormat(BoardSchema, "board")
      });

      return res.status(200).json(completion.choices[0].message.parsed);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      path: join(__dirname, '../src/data/sandwiches.json')
    });
  }
}
