import { openrouter } from "@openrouter/ai-sdk-provider";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignment, group, userProfile, wishlistItem } from "@/lib/schema";
import { formatPrice } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";
import { generateText } from "ai";
import { and, eq, isNull, or } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const requestSchema = z.object({
  groupId: z.string().uuid(),
});

const systemPrompt = `You are a helpful gift suggestion assistant for a Secret Santa exchange.
Given information about a person's wishlist and interests, suggest thoughtful gift ideas within the specified budget.
Always provide practical, purchasable gift ideas with estimated prices.
Return ONLY a valid JSON array (no markdown, no explanation) of suggestions with these fields:
- name: string (gift name)
- description: string (brief description of why this would be a good gift)
- estimatedPrice: number (estimated price in the specified currency)
- reasoning: string (why this matches their interests or wishlist style)

Example response:
[{"name":"Cozy Wool Blanket","description":"A soft, warm blanket perfect for cold evenings","estimatedPrice":45,"reasoning":"They mentioned enjoying cozy evenings at home"}]`;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { groupId } = parsed.data;

  // 1. Get user's assignment for this group
  const [userAssignment] = await db
    .select()
    .from(assignment)
    .where(
      and(
        eq(assignment.groupId, groupId),
        eq(assignment.giverUserId, session.user.id)
      )
    )
    .limit(1);

  if (!userAssignment) {
    return Response.json(
      { error: "No assignment found for this group" },
      { status: 404 }
    );
  }

  // 2. Get group info (budget range, currency)
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  // 3. Get recipient's profile (interests)
  const [recipientProfile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userAssignment.receiverUserId))
    .limit(1);

  const interests = recipientProfile?.interests || [];

  // 4. Get recipient's wishlist items
  const wishlistItems = await db
    .select()
    .from(wishlistItem)
    .where(
      and(
        eq(wishlistItem.userId, userAssignment.receiverUserId),
        or(eq(wishlistItem.groupId, groupId), isNull(wishlistItem.groupId))
      )
    )
    .limit(10);

  // 5. Build prompt
  const currency = (groupData.currency || "USD") as Currency;
  const budgetMin = groupData.budgetMin || 10;
  const budgetMax = groupData.budgetMax || 100;

  const userPrompt = `
Please suggest 5 gift ideas for someone with the following profile:

${interests.length > 0 ? `Interests: ${interests.join(", ")}` : "Interests: Not specified (suggest popular gift ideas)"}

${
  wishlistItems.length > 0
    ? `Items on their wishlist (for reference, DON'T suggest these exact items):
${wishlistItems.map((item) => `- ${item.name}${item.price ? ` (~${formatPrice(item.price, currency)})` : ""}`).join("\n")}`
    : "Their wishlist is empty - suggest popular gift ideas based on their interests."
}

Budget range: ${formatPrice(budgetMin * 100, currency)} - ${formatPrice(budgetMax * 100, currency)}

Remember: Return ONLY a valid JSON array with 5 suggestions. Each suggestion should have: name, description, estimatedPrice (number only, no currency symbol), and reasoning.`;

  try {
    // 6. Call OpenRouter
    const result = await generateText({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // 7. Parse JSON from response
    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(result.text);
      }
    } catch {
      console.error("Failed to parse AI response:", result.text);
      return Response.json(
        { error: "Failed to parse AI suggestions. Please try again." },
        { status: 500 }
      );
    }

    // Validate and clean up suggestions
    const validatedSuggestions = suggestions.map(
      (s: { name?: string; description?: string; estimatedPrice?: number; reasoning?: string }) => ({
        name: s.name || "Gift Idea",
        description: s.description || "",
        estimatedPrice: typeof s.estimatedPrice === "number" ? s.estimatedPrice : 0,
        reasoning: s.reasoning || "",
      })
    );

    return Response.json({
      suggestions: validatedSuggestions,
      currency,
      budgetRange: { min: budgetMin, max: budgetMax },
    });
  } catch (error) {
    console.error("AI suggestion error:", error);
    return Response.json(
      { error: "Failed to generate suggestions. Please try again." },
      { status: 500 }
    );
  }
}
