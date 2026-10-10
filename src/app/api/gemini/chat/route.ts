import { NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import { PRODUCTS } from "@/data/mock-data";
import type { Product } from "@/types/catalog.types";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

interface RequestPayload {
  message?: string;
  history?: ChatMessage[];
  apiKey?: string;
}

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

/**
 * Builds the compact catalog grounding text for the Gemini system prompt.
 */
function buildCatalogContext(products: Product[]): string {
  return products
    .map(
      (p) =>
        `- [${p.slug}] "${p.name}" | Price: $${p.price}${
          p.compareAtPrice ? ` (was $${p.compareAtPrice})` : ""
        } | Category: ${p.category} | In Stock: ${p.inStock ? "Yes" : "No"} (${
          p.stockCount
        } units) | Materials: ${p.materials || "Natural"} | Dimensions: ${
          p.dimensions || "N/A"
        } | Description: ${p.shortDescription || p.description} | Tags: ${p.tags.join(
          ", "
        )}`
    )
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const body: RequestPayload = await request.json().catch(() => ({}));
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    // Resolve API key: client-provided takes precedence, then server environment
    const rawKey =
      body.apiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!rawKey) {
      return NextResponse.json(
        {
          error:
            "No Gemini API key configured. Please enter your personal key in the Aura & Earth Sanctuary settings, or set GEMINI_API_KEY.",
          requiresKey: true,
        },
        { status: 400 }
      );
    }

    // Retrieve active catalog
    let catalog: Product[] = PRODUCTS;
    try {
      const res = await productService.getProducts({ limit: 50 });
      if (res.products && res.products.length > 0) {
        catalog = res.products;
      }
    } catch {
      catalog = PRODUCTS;
    }

    const catalogContext = buildCatalogContext(catalog);
    const validSlugs = catalog.map((p) => p.slug);

    const systemPrompt = `You are the AI Shopping Concierge for "Aura & Earth", a luxury organic goods and mindful sanctuary lifestyle store.
Your persona: Calm, serene, warm, knowledgeable, and honest.

STRICT CATALOG GROUNDING RULES:
1. You may ONLY recommend and discuss items that exist in the Aura & Earth catalog below. NEVER invent products, fictional materials, or unlisted prices.
2. If the user asks for a price/budget limit (e.g. "under $100"), strictly suggest items where the price is within the user's budget and state the exact price.
3. If comparing products, highlight accurate differences in materials, dimensions, aesthetics, and pricing using only the verified catalog specs.
4. If the user asks for something outside your catalog, politely and warmly clarify that Aura & Earth specializes in mindful ceramics, handcrafted textiles, aromatherapy, and organic living essentials, then guide them to the closest fitting catalog pieces.
5. You MUST return your response as a valid JSON object with EXACTLY this structure:
{
  "reply": "Your serene, helpful, and concise advice explaining why these products fit their request.",
  "recommendedSlugs": ["slug-1", "slug-2"]
}
- "recommendedSlugs" must only contain exact slugs from the catalog that match your recommendation (up to 4 slugs). If no specific product is recommended, provide an empty array [].

VERIFIED AURA & EARTH CATALOG:
${catalogContext}`;

    // Format chat history for Gemini contents array
    const contents: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }> = [];

    if (Array.isArray(body.history)) {
      for (const item of body.history.slice(-10)) {
        if (!item.content) continue;
        const role = item.role === "user" ? "user" : "model";
        contents.push({
          role,
          parts: [{ text: item.content }],
        });
      }
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Attempt generation across candidate models
    let rawResponseText = "";
    let lastError = "";
    let activeModel = CANDIDATE_MODELS[0];

    for (const model of CANDIDATE_MODELS) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          rawKey
        )}`;

        const geminiRes = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          rawResponseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          activeModel = model;
          break;
        } else {
          const errData = await geminiRes.json().catch(() => null);
          lastError =
            errData?.error?.message ||
            `HTTP ${geminiRes.status} from model ${model}`;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!rawResponseText) {
      return NextResponse.json(
        {
          error:
            lastError ||
            "Unable to generate response from Google Gemini API. Please verify your API key.",
        },
        { status: 502 }
      );
    }

    // Parse JSON output from Gemini
    let parsedReply = "";
    let parsedSlugs: string[] = [];

    try {
      // Strip potential markdown code fences if present
      const cleaned = rawResponseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      parsedReply = parsed.reply || "";
      if (Array.isArray(parsed.recommendedSlugs)) {
        parsedSlugs = parsed.recommendedSlugs;
      }
    } catch {
      // Fallback: If structured JSON parsing fails, use raw text and regex-extract known slugs
      parsedReply = rawResponseText;
      parsedSlugs = validSlugs.filter(
        (slug) =>
          rawResponseText.toLowerCase().includes(slug.toLowerCase()) ||
          rawResponseText.includes(slug)
      );
    }

    // Filter to valid catalog items
    const matchedProducts = catalog.filter((prod) =>
      parsedSlugs.includes(prod.slug)
    );

    return NextResponse.json({
      reply: parsedReply,
      recommendedProducts: matchedProducts,
      model: activeModel,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred in the AI assistant service.",
      },
      { status: 500 }
    );
  }
}
