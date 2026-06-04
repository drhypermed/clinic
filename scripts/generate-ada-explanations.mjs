import fs from 'node:fs';
import path from 'node:path';

// This script requires an API key passed via environment variable: GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Error: Please provide the GEMINI_API_KEY environment variable.');
  console.error('Usage: GEMINI_API_KEY="your_key" node scripts/generate-ada-explanations.mjs');
  process.exit(1);
}

// Ensure the paths
const digestPath = path.resolve('components/guidelines/data/ada2026/recommendationDigest.ts');
const explanationsPath = path.resolve('components/guidelines/data/ada2026/adaExplanations.ts');

// We need to parse the TypeScript digest file (which exports an array).
// Since it's not a pure JSON file, we extract the JSON portion using regex.
const digestContent = fs.readFileSync(digestPath, 'utf8');
const jsonMatch = digestContent.match(/export const ADA_2026_RECOMMENDATION_DIGEST.*?\s*=\s*(\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error('❌ Could not find the JSON array in recommendationDigest.ts');
  process.exit(1);
}

const digest = eval(`(${jsonMatch[1]})`);

// Load existing explanations so we can resume if interrupted
let existingExplanations = {};
if (fs.existsSync(explanationsPath)) {
  const fileContent = fs.readFileSync(explanationsPath, 'utf8');
  const existingMatch = fileContent.match(/export const ADA_2026_EXPLANATIONS: Record<string, string> = ({[\s\S]*});/);
  if (existingMatch) {
    try {
      existingExplanations = eval(`(${existingMatch[1]})`);
    } catch (e) {
      console.warn('⚠️ Could not parse existing adaExplanations.ts, starting fresh.');
    }
  }
}

// Build the array of all recommendations
const allRecommendations = [];
for (const chapter of digest) {
  if (chapter.recommendations && chapter.recommendations.length > 0) {
    for (const rec of chapter.recommendations) {
      allRecommendations.push({
        id: rec.id,
        text: rec.text,
        chapter: chapter.title
      });
    }
  }
}

console.log(`🔍 Found ${allRecommendations.length} total recommendations.`);
console.log(`✅ Loaded ${Object.keys(existingExplanations).length} existing explanations.`);

const saveExplanations = () => {
  const content = `export const ADA_2026_EXPLANATIONS: Record<string, string> = ${JSON.stringify(existingExplanations, null, 2)};\n`;
  fs.writeFileSync(explanationsPath, content, 'utf8');
  console.log(`💾 Saved to ${explanationsPath}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateExplanation(rec) {
  const prompt = `You are an elite Consultant Physician and Diabetologist. 
Your task is to provide a HIGHLY DETAILED, EXHAUSTIVE, and SCIENTIFIC bilingual explanation (Arabic main language with English medical terms kept) for the following ADA 2026 recommendation.

Recommendation ID: ${rec.id}
Chapter: ${rec.chapter}
Official Text: "${rec.text}"

DO NOT provide a brief summary. The user specifically complained that previous explanations were "too brief and missing lots of information". 
Provide a robust clinical breakdown covering:
1. المغزى السريري والباثولوجي (Scientific Rationale & Pathophysiology)
2. التطبيق العملي في العيادة (Clinical Application)
3. استثناءات ومحاذير إن وجدت (Caveats & Exceptions)

Format the output cleanly in plain text or simple markdown. Start immediately with the explanation without any introductory conversational text.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error('Error from Gemini API:', JSON.stringify(data));
      return null;
    }
  } catch (error) {
    console.error('Network Error:', error);
    return null;
  }
}

async function run() {
  let count = 0;
  for (const rec of allRecommendations) {
    if (!existingExplanations[rec.id] || existingExplanations[rec.id].length < 100) {
      console.log(`⏳ Generating explanation for ${rec.id}...`);
      const explanation = await generateExplanation(rec);
      if (explanation) {
        existingExplanations[rec.id] = explanation;
        count++;
        // Save every 5 records to prevent data loss
        if (count % 5 === 0) saveExplanations();
      } else {
        console.log(`⚠️ Failed to generate for ${rec.id}. Stopping to avoid rate limits.`);
        break;
      }
      await delay(2000); // Prevent rate limiting
    }
  }
  
  saveExplanations();
  console.log('🎉 Finished processing recommendations!');
}

run();
