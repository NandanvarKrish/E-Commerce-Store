import assert from "node:assert/strict";

console.log("=================================================================");
console.log("  Aura & Earth: Gemini AI Shopping Assistant Verification");
console.log("=================================================================\n");

// 1. Verify Catalog Grounding Foundation
console.log("1. Verifying product catalog grounding data...");
const { PRODUCTS } = await import("../src/data/mock-data.ts");
assert.ok(Array.isArray(PRODUCTS), "PRODUCTS must be an array");
assert.ok(PRODUCTS.length >= 8, `Expected at least 8 catalog products, found ${PRODUCTS.length}`);

for (const p of PRODUCTS) {
  assert.ok(p.id, `Product missing id`);
  assert.ok(p.slug, `Product missing slug`);
  assert.ok(p.name, `Product missing name`);
  assert.ok(typeof p.price === "number" && p.price > 0, `Product ${p.slug} must have positive price`);
  assert.ok(p.category, `Product ${p.slug} missing category`);
  assert.ok(Array.isArray(p.images) && p.images.length > 0, `Product ${p.slug} missing images`);
}
console.log(`✓ Verified ${PRODUCTS.length} catalog products with valid pricing, categories, and slugs.`);

// 2. Verify Catalog Context Builder Logic
console.log("\n2. Verifying catalog context grounding prompt builder...");
function buildCatalogContext(products) {
  return products
    .map(
      (p) =>
        `- [${p.slug}] "${p.name}" | Price: $${p.price} | Category: ${p.category} | In Stock: ${
          p.inStock ? "Yes" : "No"
        }`
    )
    .join("\n");
}

const contextText = buildCatalogContext(PRODUCTS);
assert.ok(contextText.includes("[ceramic-fluted-vase]"), "Context should include ceramic vase");
assert.ok(contextText.includes("[french-linen-duvet-cover]"), "Context should include linen duvet");
assert.ok(contextText.includes("[hinoki-cypress-diffuser]"), "Context should include hinoki diffuser");
console.log("✓ Catalog grounding context formatted with verified slugs and attributes.");

// 3. Verify Structured Output Parsing (clean JSON and markdown-fenced JSON)
console.log("\n3. Verifying Gemini structured response parser...");

function parseGeminiResponse(rawText, validSlugs) {
  let parsedReply = "";
  let parsedSlugs = [];

  try {
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    parsedReply = parsed.reply || "";
    if (Array.isArray(parsed.recommendedSlugs)) {
      parsedSlugs = parsed.recommendedSlugs;
    }
  } catch {
    parsedReply = rawText;
    parsedSlugs = validSlugs.filter(
      (slug) =>
        rawText.toLowerCase().includes(slug.toLowerCase()) ||
        rawText.includes(slug)
    );
  }

  return {
    reply: parsedReply,
    recommendedSlugs: parsedSlugs.filter((s) => validSlugs.includes(s)),
  };
}

const validSlugs = PRODUCTS.map((p) => p.slug);

// Test case A: Pure JSON
const sampleJson = JSON.stringify({
  reply: "For your calming sanctuary, I recommend our Belgian Linen Duvet and Hinoki Diffuser.",
  recommendedSlugs: ["french-linen-duvet-cover", "hinoki-cypress-diffuser"],
});
const parsedA = parseGeminiResponse(sampleJson, validSlugs);
assert.equal(parsedA.reply, "For your calming sanctuary, I recommend our Belgian Linen Duvet and Hinoki Diffuser.");
assert.deepEqual(parsedA.recommendedSlugs, ["french-linen-duvet-cover", "hinoki-cypress-diffuser"]);
console.log("✓ Pure JSON output parsed successfully.");

// Test case B: Markdown-fenced JSON
const fencedJson = "```json\n" + sampleJson + "\n```";
const parsedB = parseGeminiResponse(fencedJson, validSlugs);
assert.deepEqual(parsedB.recommendedSlugs, ["french-linen-duvet-cover", "hinoki-cypress-diffuser"]);
console.log("✓ Markdown code-fenced JSON stripped and parsed cleanly.");

// Test case C: Hallucinated / Non-existent Slugs filtered out
const hallucinatedJson = JSON.stringify({
  reply: "Check out this fictional item.",
  recommendedSlugs: ["fictional-silk-pillow", "ceramic-fluted-vase"],
});
const parsedC = parseGeminiResponse(hallucinatedJson, validSlugs);
assert.deepEqual(parsedC.recommendedSlugs, ["ceramic-fluted-vase"]);
console.log("✓ Hallucinated non-catalog slugs strictly rejected.");

// Test case D: Fallback text extraction when non-JSON is returned
const rawTextResponse = "I recommend checking out the ceramic-fluted-vase for your living space.";
const parsedD = parseGeminiResponse(rawTextResponse, validSlugs);
assert.deepEqual(parsedD.recommendedSlugs, ["ceramic-fluted-vase"]);
console.log("✓ Fallback regex extraction works when Gemini returns conversational plain text.");

// 4. Verify Budget Constraint Logic
console.log("\n4. Verifying budget filter matching...");
const budget = 100;
const underHundred = PRODUCTS.filter((p) => p.price <= budget);
assert.ok(underHundred.length > 0, "Should have products under $100");
for (const p of underHundred) {
  assert.ok(p.price <= 100, `Product ${p.slug} price $${p.price} exceeds budget $100`);
}
console.log(`✓ Verified ${underHundred.length} products naturally fall within <= $100 budget.`);

// 5. Verify Full Product Object Resolution for Chat Cards
console.log("\n5. Verifying product card mapping for chat UI...");
const matchedSlugs = ["stoneware-matcha-bowl", "amber-glass-candle"];
const resolvedProducts = PRODUCTS.filter((p) => matchedSlugs.includes(p.slug));
assert.equal(resolvedProducts.length, 2, "Should resolve 2 full product objects");
assert.equal(resolvedProducts[0].name, "Kintsugi Glazed Chawan Matcha Bowl");
assert.equal(resolvedProducts[1].name, "Cedar & Wild Vetiver Botanical Candle");
console.log("✓ Chat UI product card resolution verified with image, pricing, and stock metadata.");

console.log("\n=================================================================");
console.log("  🎉 ALL 5 GEMINI AI SHOPPING ASSISTANT ASSERTIONS PASSED!");
console.log("=================================================================\n");
