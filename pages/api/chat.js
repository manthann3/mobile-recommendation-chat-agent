import { GoogleGenerativeAI } from "@google/generative-ai";
import phonesData from "../../data/phones.json";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const PHONE_BRANDS = new Set(
  phonesData.map((phone) => phone.brand.toLowerCase())
);
const PHONE_MODELS = new Set(
  phonesData.map((phone) => phone.model.toLowerCase())
);
const ALL_PHONE_NAMES = new Set([
  ...phonesData.map((phone) => phone.brand.toLowerCase()),
  ...phonesData.map((phone) => phone.model.toLowerCase()),
  ...phonesData.map(
    (phone) => `${phone.brand.toLowerCase()} ${phone.model.toLowerCase()}`
  ),
]);

const PHONE_RELATED_TERMS = new Set([
  "phone",
  "mobile",
  "smartphone",
  "device",
  "handset",
  "galaxy",
  "iphone",
  "redmi",
  "poco",
  "realme",
  "oneplus",
  "vivo",
  "oppo",
  "motorola",
  "nokia",
  "asus",
  "tecno",
  "infinix",
]);

const ALLOWED_DB_OPERATIONS = new Set([
  // Query operations
  "show",
  "list",
  "display",
  "find",
  "get",
  "what",
  "which",
  "compare",
  // Filter operations
  "under",
  "below",
  "above",
  "between",
  "with",
  "has",
  "have",
  // Specification queries
  "price",
  "camera",
  "battery",
  "display",
  "screen",
  "charging",
  "spec",
  "specification",
  "feature",
  "one hand",
  "compact",
  "cost",
  "budget",
  // Comparison operations
  "versus",
  "vs",
  "difference",
  "better",
  "best",
  "recommend",
  "suggest",
]);

const conversationMemory = new Map();

const rateLimit = new Map();

const SYSTEM_PROMPT_SECTIONS = {
  rules: `ABSOLUTE RULES:
1. ONLY use data from the filtered phones provided
2. NEVER invent specifications or mention phones not in the filtered list
3. If asked about phones not in the list, say "That phone is not in my database"
4. Base all recommendations ONLY on the available data`,

  formatting: `RESPONSE FORMATTING:
- Single phone: Use bullet points with * 
- Multiple phones: Use comparison tables with | 
- Always include prices in INR (₹)
- Use natural language for specifications
- FOR BOLD TEXT: Use **bold text** format for all labels like **Price**, **Camera**, etc.`,

  examples: `EXAMPLES:
Single phone response:
* **Price:** ₹15,999
* **Camera:** 48MP
* **Battery:** 5000mAh

Comparison response:
| **Brand** | **Model** | **Price** | **Camera** | **Battery** |
|-----------|-----------|-----------|------------|-------------|
| Xiaomi | Note 12 | ₹13,999 | 108MP | 5000mAh |`,
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "healthy",
      databaseSize: phonesData.length,
      supportedBrands: Array.from(PHONE_BRANDS),
      memorySize: conversationMemory.size,
      rateLimitSize: rateLimit.size,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      checkRateLimit(conversationId);
    } catch (rateLimitError) {
      return res.status(429).json({
        error: "Too many requests. Please try again in a minute.",
      });
    }

    const inputValidation = await validateInputWithAI(message);
    if (!inputValidation.valid) {
      return res.status(200).json({
        response: inputValidation.reason,
        isDBQuery: false,
        allowed: false,
      });
    }

    const context = conversationMemory.get(conversationId) || {
      previousPhones: [],
      lastQuery: "",
      userPreferences: {},
    };

    const userIntent = parseUserIntent(message, context);

    const relevantPhones = getRelevantPhonesFromDB(userIntent);

    if (relevantPhones.length === 0) {
      return res.status(200).json({
        response: "No phones found in the database matching your criteria.",
        isDBQuery: true,
        databaseResults: false,
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        topK: 20,
        topP: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const systemPrompt = `You are a phone database query system. Use ONLY the filtered phone data below.

FILTERED PHONE DATA (Based on user query):
${JSON.stringify(
  relevantPhones.map((phone) => formatPhoneSpecs(phone)),
  null,
  2
)}

USER INTENT:
- Budget: ${userIntent.budget ? `Under ₹${userIntent.budget}` : "Not specified"}
- Brand: ${userIntent.brand || "Not specified"}
- Priority: ${userIntent.priority || "Not specified"}
- Comparison: ${userIntent.comparison ? "Yes" : "No"}

CONVERSATION CONTEXT:
Previous phones discussed: ${context.previousPhones.join(", ") || "None"}

${SYSTEM_PROMPT_SECTIONS.rules}

${SYSTEM_PROMPT_SECTIONS.formatting}

${SYSTEM_PROMPT_SECTIONS.examples}



USER-FRIENDLY LANGUAGE RULES:
- NEVER show raw database field names like 'oneHandUse', 'fastCharging'
- ALWAYS use natural language:
  - 'oneHandUse: true' → **Easy one-hand use:** Yes
  - 'oneHandUse: false' → **Easy one-hand use:** No
  - 'fastCharging: 25W' → **Fast charging speed:** 25W
  - Use **Easy to use with one hand** instead of 'oneHandUse'
  - Use **Fast charging speed** instead of 'fastCharging'

- Example of WRONG: 'oneHandUse: true'
- Example of CORRECT: **Easy one-hand use:** Yes

ABSOLUTELY CRITICAL: 
- For single phone queries: Use bullet points with * and **bold labels**
- For 2+ phone comparisons: You MUST use tables with **bold headers**, NEVER bullet points
- ALL labels must be in **bold** format

USER QUERY: "${message}"

Provide a helpful response using ONLY the filtered phone data. Explain your reasoning based on the available specifications.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let aiResponse = response.text();

    aiResponse = enforceDatabaseTruth(aiResponse, relevantPhones);

    const mentionedPhones = extractMentionedPhones(aiResponse, relevantPhones);
    conversationMemory.set(conversationId, {
      previousPhones: [
        ...new Set([...context.previousPhones, ...mentionedPhones]),
      ],
      lastQuery: message,
      userPreferences: updatePreferences(context.userPreferences, userIntent),
    });

    res.status(200).json({
      response: aiResponse,
      isDBQuery: true,
      hasTable: aiResponse.includes("|") && aiResponse.includes("-"),
      contextUpdated: mentionedPhones.length > 0,
      databaseResults: true,
      phonesFound: relevantPhones.length,
    });
  } catch (error) {
    console.error("Database API error:", error);
    res.status(500).json({
      error: "Database query failed",
    });
  }
}

function enhancedInputValidation(message) {
  const lowerMessage = message.toLowerCase();

  const hasPhoneTerm = Array.from(PHONE_RELATED_TERMS).some((term) =>
    lowerMessage.includes(term)
  );

  const hasSpecTerm =
    lowerMessage.includes("spec") ||
    lowerMessage.includes("feature") ||
    lowerMessage.includes("model");

  return hasPhoneTerm || hasSpecTerm;
}

async function validateInputWithAI(message) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 50, temperature: 0.1 },
    });

    const validationPrompt = `Analyze if this is a valid mobile phone database query about specifications, comparisons, or recommendations.

Message: "${message}"

Valid queries: Asking about phone specs, prices, comparisons, recommendations, features.
Invalid queries: Roleplay, jokes, other topics, system requests, off-topic.

Respond with ONLY:
- "VALID" - if about phone database queries
- "INVALID" - if anything else

Response:`;

    const result = await model.generateContent(validationPrompt);
    const response = await result.response;
    const validationResult = response.text().trim();

    if (validationResult === "VALID") {
      return { valid: true };
    } else {
      return {
        valid: false,
        reason:
          "I can only answer questions about mobile phones from my database. Please ask about phone specifications, comparisons, or recommendations.",
      };
    }
  } catch (error) {
    console.error("AI validation failed:", error);
    if (enhancedInputValidation(message)) {
      return { valid: true };
    }

    return {
      valid: false,
      reason:
        "I specialize in phone database queries. Ask me about phone specifications, comparisons within my database, or recommendations based on features and budget.",
    };
  }
}

function parseUserIntent(message, context) {
  const lowerMessage = message.toLowerCase();
  const intent = {
    budget: null,
    brand: null,
    priority: null,
    comparison: false,
    features: [],
  };

  const budgetMatch =
    message.match(/(\d+)\s*(k|thousand|inr|rs|₹)/i) ||
    message.match(/under\s*(\d+)/i) ||
    message.match(/(\d+)\s*below/i);
  if (budgetMatch) {
    intent.budget =
      parseInt(budgetMatch[1]) *
      (budgetMatch[2]?.toLowerCase() === "k" ? 1000 : 1);
  }

  const foundBrands = findMentionedBrands(message);
  if (foundBrands.length > 0) {
    intent.brand = foundBrands[0];
  }

  if (lowerMessage.includes("camera")) intent.priority = "camera";
  else if (lowerMessage.includes("battery")) intent.priority = "battery";
  else if (lowerMessage.includes("display")) intent.priority = "display";
  else if (lowerMessage.includes("charging")) intent.priority = "charging";

  intent.comparison =
    lowerMessage.includes("compare") ||
    lowerMessage.includes("versus") ||
    lowerMessage.includes("vs") ||
    lowerMessage.includes("difference");

  if (context.userPreferences.maxBudget && !intent.budget) {
    intent.budget = context.userPreferences.maxBudget;
  }
  if (context.userPreferences.priorityCamera && !intent.priority) {
    intent.priority = "camera";
  }

  return intent;
}

function findMentionedBrands(message) {
  const lowerMessage = ` ${message.toLowerCase()} `;
  const foundBrands = [];

  PHONE_BRANDS.forEach((brand) => {
    if (lowerMessage.includes(` ${brand} `)) {
      foundBrands.push(brand);
    }
  });

  return foundBrands;
}

function getRelevantPhonesFromDB(intent) {
  let filteredPhones = [...phonesData];

  if (intent.brand) {
    filteredPhones = filteredPhones.filter((phone) =>
      phone.brand.toLowerCase().includes(intent.brand)
    );
  }

  if (intent.budget) {
    filteredPhones = filteredPhones.filter(
      (phone) => phone.price <= intent.budget
    );
  }

  if (intent.priority === "camera") {
    filteredPhones.sort((a, b) => {
      const aMP = parseInt(a.camera);
      const bMP = parseInt(b.camera);
      return bMP - aMP;
    });
  } else if (intent.priority === "battery") {
    filteredPhones.sort((a, b) => {
      const aBattery = parseInt(a.battery);
      const bBattery = parseInt(b.battery);
      return bBattery - aBattery;
    });
  } else if (intent.priority === "charging") {
    filteredPhones.sort((a, b) => {
      const aCharge = parseInt(a.fastCharging);
      const bCharge = parseInt(b.fastCharging);
      return bCharge - aCharge;
    });
  }

  return filteredPhones.slice(0, 10);
}

function formatPhoneSpecs(phone) {
  return {
    brand: phone.brand,
    model: phone.model,
    price: `₹${phone.price.toLocaleString()}`,
    camera: `${phone.camera}MP`,
    battery: `${phone.battery}mAh`,
    display: `${phone.display} inch`,
    oneHandUse: phone.oneHandUse ? "Yes" : "No",
    fastCharging: `${phone.fastCharging}W`,
  };
}

function enforceDatabaseTruth(response, allowedPhones) {
  let cleaned = response;

  phonesData.forEach((phone) => {
    if (!allowedPhones.includes(phone)) {
      const regex = new RegExp(phone.brand + ".*?" + phone.model, "gi");
      cleaned = cleaned.replace(regex, "");
    }
  });

  const opinionPatterns = [
    /in my opinion|I think|I believe|probably|maybe|perhaps|usually|typically/gi,
    /excellent|amazing|great|awesome|terrible|bad|poor|worth it/gi,
  ];

  opinionPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  return cleaned.trim();
}

function extractMentionedPhones(response, allowedPhones) {
  const phones = [];
  allowedPhones.forEach((phone) => {
    const fullName = `${phone.brand} ${phone.model}`;
    if (
      response.includes(phone.brand) ||
      response.includes(phone.model) ||
      response.includes(fullName)
    ) {
      phones.push(fullName);
    }
  });
  return phones;
}

function updatePreferences(preferences, intent) {
  const newPrefs = { ...preferences };

  if (intent.budget) newPrefs.maxBudget = intent.budget;
  if (intent.priority === "camera") newPrefs.priorityCamera = true;
  if (intent.priority === "battery") newPrefs.priorityBattery = true;
  if (intent.priority === "display") newPrefs.priorityDisplay = true;

  return newPrefs;
}

function checkRateLimit(conversationId) {
  const now = Date.now();
  const windowStart = now - 60000;

  if (!rateLimit.has(conversationId)) {
    rateLimit.set(conversationId, []);
  }

  const requests = rateLimit
    .get(conversationId)
    .filter((time) => time > windowStart);
  rateLimit.set(conversationId, requests);

  if (requests.length >= 10) {
    throw new Error("Rate limit exceeded");
  }

  requests.push(now);
}

export function getConversationContext(conversationId = "default") {
  return (
    conversationMemory.get(conversationId) || {
      previousPhones: [],
      lastQuery: "",
    }
  );
}

export function clearConversationContext(conversationId = "default") {
  conversationMemory.delete(conversationId);
  rateLimit.delete(conversationId);
  return { success: true, message: "Context cleared" };
}
