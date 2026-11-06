import Groq from "groq-sdk";

export interface ExtractedTopic {
  extracted_topic_name: string;
  question_count: number;
  difficulty_distribution: {
    level_1_easy: number;
    level_2_medium: number;
    level_3_hard: number;
  };
}

export interface ExtractedBlueprintResult {
  section_name?: string;
  subject_name?: string;
  total_questions?: number;
  topics: ExtractedTopic[];
}

export async function extractBlueprintFromImage(
  base64Image: string,
  mimeType: string = "image/png"
): Promise<ExtractedBlueprintResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GROQ_API_KEY is not configured in .env. Please provide your Groq API key to enable AI blueprint extraction."
    );
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are an expert examination blueprint extraction specialist.
Your task is to analyze the uploaded blueprint image for an MCQ assessment section and extract the structured table data.
Extract all topics listed with their question counts and difficulty distributions (Level 1/Easy, Level 2/Medium, Level 3/Hard).
Return ONLY valid JSON matching this schema:
{
  "section_name": "Section title if visible, else null",
  "subject_name": "Subject name if visible, else null",
  "total_questions": 0,
  "topics": [
    {
      "extracted_topic_name": "Name of topic exactly as printed",
      "question_count": 4,
      "difficulty_distribution": {
        "level_1_easy": 2,
        "level_2_medium": 1,
        "level_3_hard": 1
      }
    }
  ]
}
Make sure:
1. Every visible topic row is included.
2. Sum of level_1_easy + level_2_medium + level_3_hard MUST equal question_count.
3. If difficulty levels are not specified per topic, set level_1_easy=question_count and others to 0.
4. Output strict JSON with no markdown backticks or commentary.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response received from Groq Vision API.");
  }

  try {
    const parsed = JSON.parse(content) as ExtractedBlueprintResult;
    return parsed;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse AI extraction JSON: ${errorMsg}`);
  }
}
