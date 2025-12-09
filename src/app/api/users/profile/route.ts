import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional().nullable(),
  interests: z.array(z.string().max(50)).max(20).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create user profile
  let [profile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1);

  if (!profile) {
    // Create profile if it doesn't exist
    [profile] = await db
      .insert(userProfile)
      .values({
        userId: session.user.id,
        bio: null,
        interests: [],
      })
      .returning();
  }

  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Check if profile exists
  const [existingProfile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, session.user.id))
    .limit(1);

  let profile;

  if (existingProfile) {
    // Update existing profile
    const updateData: Record<string, unknown> = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.interests !== undefined) updateData.interests = data.interests;

    [profile] = await db
      .update(userProfile)
      .set(updateData)
      .where(eq(userProfile.userId, session.user.id))
      .returning();
  } else {
    // Create new profile
    [profile] = await db
      .insert(userProfile)
      .values({
        userId: session.user.id,
        bio: data.bio || null,
        interests: data.interests || [],
      })
      .returning();
  }

  return Response.json({ profile });
}
