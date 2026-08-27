import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

type ReplyLanguage = "id" | "en";

type KnowledgeItem = {
  intent?: string;
  keywords?: string[];
  answer?: string;
  answer_id?: string;
  answer_en?: string;
  suggestions?: string[];
};

function loadKnowledgeBase(): KnowledgeItem[] {
  try {
    const filePath = path.join(process.cwd(), "data/knowledge.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (err) {
    console.error("Failed to load knowledge base:", err);
    return [];
  }
}

const knowledgeBase = loadKnowledgeBase();

// Flatten knowledge base into searchable entries
type FuseEntry = {
  keyword: string;
  intentIndex: number;
};

const fuseEntries: FuseEntry[] = [];
knowledgeBase.forEach((item, index) => {
  item.keywords?.forEach((kw) => {
    fuseEntries.push({ keyword: kw.toLowerCase(), intentIndex: index });
  });
});

const fuse = new Fuse(fuseEntries, {
  keys: ["keyword"],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

function normalizeInput(message: string): string {
  return message
    .toLowerCase()
    .replace(/[?!.,;:'"()\[\]{}<>]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(message: string): ReplyLanguage {
  const lower = message.toLowerCase();
  const padded = ` ${lower} `;
  const idHints = [" apa ", " siapa ", " dimana ", " bagaimana ", " kenapa ", "kamu", "saya", "yang", "dan", "tidak", "terima kasih", "tolong", "gimana", "bisa", "buat"];
  const enHints = [" what ", " who ", " where ", " when ", " why ", " how ", " you ", " i ", " is ", " are ", " can ", " please", "thanks", "thank you", "does"];
  const idScore = idHints.filter((h) => padded.includes(h)).length;
  const enScore = enHints.filter((h) => padded.includes(h)).length;
  return enScore > idScore ? "en" : "id";
}

function pickAnswer(item: KnowledgeItem, language: ReplyLanguage): string {
  if (language === "en") return item.answer_en || item.answer || item.answer_id || "";
  return item.answer_id || item.answer || item.answer_en || "";
}

const defaultSuggestions = {
  id: ["Skill apa saja?", "Lihat project", "Pendidikan", "Cara kontak", "Pengalaman"],
  en: ["What are his skills?", "View projects", "Education", "How to contact", "Experience"],
};

function getBotReply(message: string) {
  const normalized = normalizeInput(message);
  const language = detectLanguage(normalized);
  const inputWords = normalized.split(/\s+/).filter(w => w.length > 0);

  // 1. EXACT PHRASE MATCH (Fast path for exact greetings/questions)
  const exactMatch = knowledgeBase.find(item => 
    item.keywords?.some(kw => normalized === kw.toLowerCase())
  );
  
  if (exactMatch) {
    const answer = pickAnswer(exactMatch, language);
    return {
      reply: answer,
      suggestions: exactMatch.suggestions || defaultSuggestions[language],
      didYouMean: null
    };
  }

  // 2. TOKEN-BASED FUZZY MATCHING (Robust against typos and noise words)
  const intentScores = new Map<number, { score: number, matches: number }>();
  
  // Stop words to ignore during token matching so they don't hijack the intent
  const stopWords = ["apa", "siapa", "dimana", "kapan", "kenapa", "bagaimana", "cara", "yang", "dan", "untuk", "dari", "ke", "di", "tiovaldo", "tio", "ratungalo", "dia", "kamu", "saya", "buat", "bikin", "itu", "ini"];
  
  for (const word of inputWords) {
    // Only fuzzy search meaningful words
    if (stopWords.includes(word) || word.length <= 2) continue;
    
    const wordResults = fuse.search(word);
    if (wordResults.length > 0) {
      const bestForWord = wordResults[0];
      const score = bestForWord.score ?? 1;
      
      // If the word matches a keyword confidently
      if (score <= 0.35) {
        const idx = bestForWord.item.intentIndex;
        const current = intentScores.get(idx) || { score: 0, matches: 0 };
        current.score += score;
        current.matches += 1;
        intentScores.set(idx, current);
      }
    }
  }

  if (intentScores.size > 0) {
    // Sort intents: highest number of matched words first, then lowest average score
    const sorted = Array.from(intentScores.entries()).sort((a, b) => {
      if (b[1].matches !== a[1].matches) return b[1].matches - a[1].matches;
      return (a[1].score / a[1].matches) - (b[1].score / b[1].matches);
    });
    
    const bestMatch = sorted[0];
    const avgScore = bestMatch[1].score / bestMatch[1].matches;
    const bestItem = knowledgeBase[bestMatch[0]];
    
    if (avgScore <= 0.35) {
      // Confident match
      return {
        reply: pickAnswer(bestItem, language),
        suggestions: bestItem.suggestions || defaultSuggestions[language],
        didYouMean: null
      };
    }
  }
  
  // 3. FULL PHRASE FUZZY MATCH (Fallback for multi-word intents that token matching missed)
  const fullResults = fuse.search(normalized);
  if (fullResults.length > 0) {
    const bestResult = fullResults[0];
    const bestScore = bestResult.score ?? 1;
    const bestItem = knowledgeBase[bestResult.item.intentIndex];

    if (bestScore <= 0.3) {
      return {
        reply: pickAnswer(bestItem, language),
        suggestions: bestItem.suggestions || defaultSuggestions[language],
        didYouMean: null
      };
    }

    if (bestScore <= 0.5) {
      // Uncertain match -> Did you mean?
      const seenIntents = new Set<number>();
      const didYouMeanItems: string[] = [];

      for (const result of fullResults.slice(0, 5)) {
        const idx = result.item.intentIndex;
        if (!seenIntents.has(idx) && (result.score ?? 1) <= 0.5) {
          seenIntents.add(idx);
          const item = knowledgeBase[idx];
          const label = item.keywords?.[0] || item.intent || "Unknown";
          didYouMeanItems.push(label.charAt(0).toUpperCase() + label.slice(1));
          if (didYouMeanItems.length >= 3) break;
        }
      }

      if (didYouMeanItems.length > 0) {
        return {
          reply: language === "en" 
            ? "I'm not sure I understand. Did you mean one of these topics?" 
            : "Hmm, saya kurang yakin. Mungkin maksud kamu salah satu topik ini?",
          suggestions: defaultSuggestions[language],
          didYouMean: didYouMeanItems
        };
      }
    }
  }

  // 4. NO MATCH AT ALL -> FALLBACK
  const fallbacks = language === "en"
    ? ["I don't have information about that yet. Here are some topics I can help with:", "Sorry, I couldn't find the answer. How about asking about one of these topics?"]
    : ["Hmm, saya belum punya info tentang itu. Coba tanyakan salah satu topik berikut:", "Maaf, saya belum bisa menjawab itu. Berikut topik yang bisa saya bantu:"];

  return {
    reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    suggestions: defaultSuggestions[language],
    didYouMean: null,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ reply: "Pesan tidak boleh kosong.", suggestions: [], didYouMean: null }, { status: 400 });
    }

    await delay(500 + Math.random() * 500);
    const result = getBotReply(message);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ reply: "Terjadi kesalahan pada server.", suggestions: [], didYouMean: null }, { status: 500 });
  }
}
