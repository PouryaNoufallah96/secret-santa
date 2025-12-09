# Implementation Plan: Secret Santa Application

## Overview

Build a full-featured Secret Santa application with group management, random assignment algorithm, wishlists, AI gift suggestions, anonymous messaging, and a festive Christmas theme with snowfall effects.

---

## Phase 1: Foundation & Database Schema

Set up the database schema and core utilities needed by all other features.

### Tasks

- [ ] Extend database schema in `src/lib/schema.ts` with all new tables [complex]
  - [ ] Add `user_profile` table (bio, interests array)
  - [ ] Add `group` table with all fields
  - [ ] Add `group_member` table with roles
  - [ ] Add `exclusion_rule` table
  - [ ] Add `assignment` table
  - [ ] Add `wishlist_item` table
  - [ ] Add `notification` table
  - [ ] Add `anonymous_message` table
  - [ ] Add `group_activity` table
  - [ ] Add `event_details` table
  - [ ] Add `rsvp` table
  - [ ] Add `gift_history` table
- [ ] Create TypeScript types in `src/lib/types.ts`
- [ ] Create utility functions in `src/lib/secret-santa.ts`
- [ ] Run database migration to create tables
- [ ] Install additional shadcn/ui components

### Technical Details

**Database Schema (add to `src/lib/schema.ts`):**

```typescript
import { pgTable, text, integer, boolean, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./schema"; // existing user table

// User Profile Extension
export const userProfile = pgTable(
  "user_profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    bio: text("bio"),
    interests: text("interests").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_profile_user_id_idx").on(table.userId)]
);

// Group
export const group = pgTable(
  "group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    budgetMin: integer("budget_min"),
    budgetMax: integer("budget_max"),
    currency: text("currency").default("USD").notNull(),
    exchangeDate: timestamp("exchange_date"),
    inviteCode: text("invite_code").notNull().unique(),
    drawCompleted: boolean("draw_completed").default(false).notNull(),
    drawDate: timestamp("draw_date"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("group_invite_code_idx").on(table.inviteCode),
    index("group_created_by_idx").on(table.createdById),
  ]
);

// Group Member
export const groupMember = pgTable(
  "group_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["admin", "member"] })
      .default("member")
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    hasViewedAssignment: boolean("has_viewed_assignment").default(false).notNull(),
  },
  (table) => [
    index("group_member_group_id_idx").on(table.groupId),
    index("group_member_user_id_idx").on(table.userId),
  ]
);

// Exclusion Rule
export const exclusionRule = pgTable(
  "exclusion_rule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    excludedUserId: text("excluded_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("exclusion_rule_group_id_idx").on(table.groupId)]
);

// Assignment
export const assignment = pgTable(
  "assignment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    giverUserId: text("giver_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverUserId: text("receiver_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    drawRound: integer("draw_round").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("assignment_group_id_idx").on(table.groupId),
    index("assignment_giver_idx").on(table.giverUserId),
    index("assignment_receiver_idx").on(table.receiverUserId),
  ]
);

// Wishlist Item
export const wishlistItem = pgTable(
  "wishlist_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    groupId: uuid("group_id").references(() => group.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    url: text("url"),
    imageUrl: text("image_url"),
    price: integer("price"), // Store in cents
    priority: text("priority", { enum: ["low", "medium", "high"] })
      .default("medium")
      .notNull(),
    isPurchased: boolean("is_purchased").default(false).notNull(),
    purchasedByUserId: text("purchased_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    purchasedAt: timestamp("purchased_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wishlist_item_user_id_idx").on(table.userId),
    index("wishlist_item_group_id_idx").on(table.groupId),
  ]
);

// Notification
export const notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "assignment_ready",
        "new_member",
        "draw_complete",
        "message",
        "reminder",
        "wishlist_update",
        "event_update",
      ],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url"),
    relatedGroupId: uuid("related_group_id").references(() => group.id, { onDelete: "cascade" }),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_unread_idx").on(table.userId, table.isRead),
  ]
);

// Anonymous Message
export const anonymousMessage = pgTable(
  "anonymous_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignment.id, { onDelete: "cascade" }),
    senderType: text("sender_type", { enum: ["santa", "recipient"] }).notNull(),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("anon_message_assignment_idx").on(table.assignmentId)]
);

// Group Activity
export const groupActivity = pgTable(
  "group_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    activityType: text("activity_type", {
      enum: [
        "member_joined",
        "draw_completed",
        "event_updated",
        "wishlist_added",
        "redraw_triggered",
      ],
    }).notNull(),
    metadata: text("metadata"), // JSON string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("group_activity_group_id_idx").on(table.groupId)]
);

// Event Details
export const eventDetails = pgTable(
  "event_details",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" })
      .unique(),
    locationName: text("location_name"),
    locationAddress: text("location_address"),
    virtualLink: text("virtual_link"),
    eventNotes: text("event_notes"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("event_details_group_id_idx").on(table.groupId)]
);

// RSVP
export const rsvp = pgTable(
  "rsvp",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["attending", "not_attending", "maybe"] }).notNull(),
    note: text("note"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("rsvp_group_id_idx").on(table.groupId)]
);

// Gift History
export const giftHistory = pgTable(
  "gift_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    giverUserId: text("giver_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverUserId: text("receiver_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    giftDescription: text("gift_description"),
    giftImageUrl: text("gift_image_url"),
    year: integer("year").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("gift_history_group_id_idx").on(table.groupId),
    index("gift_history_giver_idx").on(table.giverUserId),
  ]
);
```

**Types file (`src/lib/types.ts`):**

```typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

// Select types
export type User = InferSelectModel<typeof schema.user>;
export type Group = InferSelectModel<typeof schema.group>;
export type GroupMember = InferSelectModel<typeof schema.groupMember>;
export type Assignment = InferSelectModel<typeof schema.assignment>;
export type WishlistItem = InferSelectModel<typeof schema.wishlistItem>;
export type Notification = InferSelectModel<typeof schema.notification>;
// ... etc for all tables

// Insert types
export type NewGroup = InferInsertModel<typeof schema.group>;
export type NewWishlistItem = InferInsertModel<typeof schema.wishlistItem>;
// ... etc

// Extended types
export type GroupWithMembers = Group & {
  members: (GroupMember & { user: User })[];
  memberCount: number;
};

// Currency type
export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK";
export const SUPPORTED_CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
];
```

**Utility functions (`src/lib/secret-santa.ts`):**

```typescript
// Invite code generation
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Currency formatting
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// Date formatting
export function formatExchangeDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

**CLI Commands:**

```bash
# Install additional shadcn components
pnpm dlx shadcn@latest add tabs select calendar popover tooltip progress scroll-area switch alert alert-dialog

# Generate and run migrations
pnpm run db:generate
pnpm run db:migrate
```

---

## Phase 2: Christmas Theme & Styling

Implement the festive Christmas theme with colors, fonts, and snowfall effect.

### Tasks

- [ ] Update Tailwind CSS configuration with Christmas color palette
- [ ] Add Nunito font for playful headings
- [ ] Create snowfall particle effect component `src/components/ui/snowfall.tsx`
- [ ] Create Christmas-themed CSS variables for light and dark modes
- [ ] Update global styles in `src/app/globals.css`

### Technical Details

**Tailwind CSS Colors (add to `tailwind.config.ts` or CSS variables):**

```css
/* Add to src/app/globals.css */
:root {
  /* Christmas colors - Light mode */
  --christmas-red: 210 75% 48%; /* #D42426 */
  --christmas-green: 150 60% 22%; /* #165B33 */
  --christmas-gold: 42 94% 56%; /* #F8B229 */
  --snow-white: 0 0% 100%; /* #FFFAFA */
  --ice-blue: 207 100% 82%; /* #A5D8FF */
  --holly-green: 150 70% 25%; /* #146B3A */
  --berry-red: 359 65% 44%; /* #BB2528 */
  --cream: 40 100% 95%; /* #FFF8E7 */
}

.dark {
  /* Christmas colors - Dark mode */
  --night-sky: 230 20% 13%; /* #1A1B26 */
  --pine-dark: 150 60% 12%; /* #0D3320 */
  --warm-glow: 50 100% 62%; /* #FFD93D */
}
```

**Nunito Font (add to `src/app/layout.tsx`):**

```typescript
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

// Add to html className: nunito.variable
```

**Snowfall Component (`src/components/ui/snowfall.tsx`):**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

export function Snowfall({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snowflakes: Snowflake[] = [];
    const config = {
      count: 50,
      speed: { min: 1, max: 3 },
      wind: { min: -0.5, max: 0.5 },
      radius: { min: 1, max: 4 },
      opacity: { min: 0.4, max: 0.8 },
    };

    // Initialize snowflakes
    for (let i = 0; i < config.count; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * (config.radius.max - config.radius.min) + config.radius.min,
        speed: Math.random() * (config.speed.max - config.speed.min) + config.speed.min,
        wind: Math.random() * (config.wind.max - config.wind.min) + config.wind.min,
        opacity: Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > canvas.height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, prefersReducedMotion]);

  if (!enabled || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
```

---

## Phase 3: Group Management

Build the group CRUD operations, invite system, and member management.

### Tasks

- [ ] Create Groups API route `src/app/api/groups/route.ts` (GET list, POST create)
- [ ] Create Group detail API `src/app/api/groups/[groupId]/route.ts` (GET, PATCH, DELETE)
- [ ] Create Join API `src/app/api/groups/[groupId]/join/route.ts`
- [ ] Create Members API `src/app/api/groups/[groupId]/members/route.ts`
- [ ] Create Invite regenerate API `src/app/api/groups/[groupId]/invite/route.ts`
- [ ] Create groups list page `src/app/groups/page.tsx`
- [ ] Create new group form page `src/app/groups/new/page.tsx`
- [ ] Create group dashboard page `src/app/groups/[groupId]/page.tsx`
- [ ] Create join group page `src/app/groups/join/page.tsx`
- [ ] Create GroupCard component `src/components/groups/group-card.tsx`
- [ ] Create GroupForm component `src/components/groups/group-form.tsx`
- [ ] Create MemberList component `src/components/groups/member-list.tsx`
- [ ] Create InviteLink component `src/components/groups/invite-link.tsx`
- [ ] Update site header with groups navigation
- [ ] Update dashboard to show groups overview

### Technical Details

**Groups API (`src/app/api/groups/route.ts`):**

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember } from "@/lib/schema";
import { generateInviteCode } from "@/lib/secret-santa";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  currency: z
    .enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"])
    .default("USD"),
  exchangeDate: z.string().datetime().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Get all groups where user is a member
  const userGroups = await db
    .select()
    .from(group)
    .innerJoin(groupMember, eq(group.id, groupMember.groupId))
    .where(eq(groupMember.userId, session.user.id));

  return Response.json({ groups: userGroups });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const inviteCode = generateInviteCode();

  const [newGroup] = await db
    .insert(group)
    .values({
      ...parsed.data,
      exchangeDate: parsed.data.exchangeDate ? new Date(parsed.data.exchangeDate) : null,
      inviteCode,
      createdById: session.user.id,
    })
    .returning();

  // Add creator as admin member
  await db.insert(groupMember).values({
    groupId: newGroup.id,
    userId: session.user.id,
    role: "admin",
  });

  return Response.json({ group: newGroup }, { status: 201 });
}
```

**Join API (`src/app/api/groups/[groupId]/join/route.ts`):**

```typescript
export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  // Validate invite code, add user as member, create notification, log activity
}
```

**File paths:**

- `src/app/groups/page.tsx` - List all user's groups
- `src/app/groups/new/page.tsx` - Create group form with currency selector
- `src/app/groups/[groupId]/page.tsx` - Group dashboard
- `src/app/groups/join/page.tsx` - Join via invite code input

---

## Phase 4: Secret Santa Draw

Implement the draw algorithm, exclusion rules, and assignment reveal.

### Tasks

- [ ] Create Exclusions API `src/app/api/groups/[groupId]/exclusions/route.ts`
- [ ] Create Draw API `src/app/api/groups/[groupId]/draw/route.ts` (POST trigger, DELETE reset)
- [ ] Create Assignment API `src/app/api/groups/[groupId]/assignment/route.ts`
- [ ] Implement derangement algorithm with exclusion support in `src/lib/secret-santa.ts`
- [ ] Create draw management page `src/app/groups/[groupId]/draw/page.tsx`
- [ ] Create ExclusionManager component `src/components/groups/exclusion-manager.tsx`
- [ ] Create DrawControls component `src/components/draw/draw-controls.tsx`
- [ ] Create AssignmentReveal component with animation `src/components/draw/assignment-reveal.tsx`
- [ ] Create CountdownTimer component `src/components/draw/countdown-timer.tsx`

### Technical Details

**Derangement Algorithm (`src/lib/secret-santa.ts`):**

```typescript
export function generateAssignments(
  memberIds: string[],
  exclusions: Map<string, Set<string>>
): Map<string, string> | null {
  const n = memberIds.length;
  if (n < 2) return null;

  // Build valid receivers for each giver
  const validReceivers: Map<string, string[]> = new Map();
  for (const giver of memberIds) {
    const excluded = exclusions.get(giver) || new Set();
    const valid = memberIds.filter((r) => r !== giver && !excluded.has(r));
    if (valid.length === 0) return null; // Impossible
    validReceivers.set(giver, valid);
  }

  // Try to find valid assignment (max 100 attempts)
  for (let attempt = 0; attempt < 100; attempt++) {
    const assignments = new Map<string, string>();
    const usedReceivers = new Set<string>();
    const shuffled = [...memberIds].sort(() => Math.random() - 0.5);

    let success = true;
    for (const giver of shuffled) {
      const valid = validReceivers.get(giver)!.filter((r) => !usedReceivers.has(r));
      if (valid.length === 0) {
        success = false;
        break;
      }
      const receiver = valid[Math.floor(Math.random() * valid.length)];
      assignments.set(giver, receiver);
      usedReceivers.add(receiver);
    }

    if (success && usedReceivers.size === n) {
      return assignments;
    }
  }

  return null; // Could not find valid assignment
}
```

**Draw API (`src/app/api/groups/[groupId]/draw/route.ts`):**

```typescript
export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  // 1. Verify user is admin
  // 2. Get all members
  // 3. Get exclusion rules, build exclusion map
  // 4. Call generateAssignments()
  // 5. If null, return error "Cannot generate valid assignments with current exclusions"
  // 6. Delete any existing assignments for this group
  // 7. Insert new assignments
  // 8. Update group.drawCompleted = true, drawDate = now
  // 9. Create notifications for all members
  // 10. Log activity
}

export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
  // Reset draw: delete assignments, set drawCompleted = false
  // Only allowed if exchange date hasn't passed
}
```

**Assignment Reveal Animation (`src/components/draw/assignment-reveal.tsx`):**

```typescript
// States: wrapped -> unwrapping -> revealed
// Wrapped: Gift box with ribbon
// Unwrapping: Animation of ribbon untying, box opening
// Revealed: Show assigned person's name and avatar with confetti

const [state, setState] = useState<"wrapped" | "unwrapping" | "revealed">("wrapped");
```

---

## Phase 5: Wishlist System

Build wishlist CRUD operations and purchase tracking.

### Tasks

- [ ] Create Wishlists API `src/app/api/wishlists/route.ts` (GET, POST)
- [ ] Create Wishlist item API `src/app/api/wishlists/[itemId]/route.ts` (GET, PATCH, DELETE)
- [ ] Create Purchase API `src/app/api/wishlists/[itemId]/purchase/route.ts`
- [ ] Create Recipient wishlist API `src/app/api/wishlists/recipient/[groupId]/route.ts`
- [ ] Create wishlists page `src/app/wishlists/page.tsx`
- [ ] Create group wishlist page `src/app/wishlists/[groupId]/page.tsx`
- [ ] Create recipient wishlist page `src/app/groups/[groupId]/wishlist/page.tsx`
- [ ] Create WishlistForm component `src/components/wishlists/wishlist-form.tsx`
- [ ] Create WishlistItemCard component `src/components/wishlists/wishlist-item-card.tsx`
- [ ] Create WishlistList component `src/components/wishlists/wishlist-list.tsx`
- [ ] Create PurchaseButton component `src/components/wishlists/purchase-button.tsx`
- [ ] Create PriorityBadge component `src/components/wishlists/priority-badge.tsx`

### Technical Details

**Wishlists API (`src/app/api/wishlists/route.ts`):**

```typescript
const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().int().min(0).optional(), // cents
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  groupId: z.string().uuid().optional(), // null for global wishlist
});
```

**Recipient Wishlist API (`src/app/api/wishlists/recipient/[groupId]/route.ts`):**

```typescript
// Get the user's assignment for this group
// Return the receiver's wishlist items
// Include isPurchased only if purchasedByUserId === current user
// Hide purchasedByUserId from response (preserve secrecy)
```

**Purchase visibility logic:**

- Owner sees their own items but NOT who purchased them
- Purchaser sees their own purchase status
- Other Secret Santas don't see purchase status

---

## Phase 6: AI Gift Suggestions

Integrate AI-powered gift recommendations using OpenRouter.

### Tasks

- [ ] Create AI suggestions API `src/app/api/ai/suggestions/route.ts`
- [ ] Create user profile API `src/app/api/users/profile/route.ts`
- [ ] Create SuggestionCard component `src/components/ai/suggestion-card.tsx`
- [ ] Create SuggestionList component `src/components/ai/suggestion-list.tsx`
- [ ] Create GetSuggestionsButton component `src/components/ai/get-suggestions-btn.tsx`
- [ ] Update profile page with interests editor
- [ ] Integrate suggestions into recipient wishlist page

### Technical Details

**AI Suggestions API (`src/app/api/ai/suggestions/route.ts`):**

```typescript
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const systemPrompt = `You are a helpful gift suggestion assistant for a Secret Santa exchange.
Given information about a person's wishlist and interests, suggest thoughtful gift ideas within the specified budget.
Always provide practical, purchasable gift ideas with estimated prices.
Return a JSON array of suggestions with: name, description, estimatedPrice, reasoning.`;

export async function POST(request: Request) {
  // 1. Validate session
  // 2. Get assignment to verify user is the Santa
  // 3. Get recipient's profile (interests)
  // 4. Get recipient's wishlist items
  // 5. Get group budget range
  // 6. Build prompt with context
  // 7. Call OpenRouter
  // 8. Parse and return suggestions

  const userPrompt = `
Please suggest 5 gift ideas for someone with the following profile:

Interests: ${interests.join(", ")}

Items on their wishlist (for reference):
${wishlistItems.map((item) => `- ${item.name}${item.price ? ` (~${formatPrice(item.price, currency)})` : ""}`).join("\n")}

Budget range: ${formatPrice(budgetMin, currency)} - ${formatPrice(budgetMax, currency)}

Return as JSON array with fields: name, description, estimatedPrice, reasoning
`;

  const result = await generateText({
    model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
    system: systemPrompt,
    prompt: userPrompt,
  });

  // Parse JSON from response
  const suggestions = JSON.parse(result.text);
  return Response.json({ suggestions });
}
```

---

## Phase 7: Communication & Notifications

Build the in-app notification system and anonymous messaging.

### Tasks

- [ ] Create Notifications API `src/app/api/notifications/route.ts`
- [ ] Create Mark read API `src/app/api/notifications/read/route.ts`
- [ ] Create Messages API `src/app/api/groups/[groupId]/messages/route.ts`
- [ ] Create notifications page `src/app/notifications/page.tsx`
- [ ] Create messages page `src/app/groups/[groupId]/messages/page.tsx`
- [ ] Create NotificationBell component `src/components/notifications/notification-bell.tsx`
- [ ] Create NotificationDropdown component `src/components/notifications/notification-dropdown.tsx`
- [ ] Create NotificationItem component `src/components/notifications/notification-item.tsx`
- [ ] Create MessageThread component `src/components/messages/message-thread.tsx`
- [ ] Create MessageInput component `src/components/messages/message-input.tsx`
- [ ] Create MessageBubble component `src/components/messages/message-bubble.tsx`
- [ ] Add notification bell to site header
- [ ] Create notification helper functions

### Technical Details

**Notification creation helper (`src/lib/notifications.ts`):**

```typescript
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  relatedGroupId?: string;
}) {
  return db.insert(notification).values(data).returning();
}

// Usage examples:
// - Draw complete: notify all members
// - New member: notify group admin
// - New message: notify recipient
// - Assignment ready: notify individual
```

**Anonymous Messages API (`src/app/api/groups/[groupId]/messages/route.ts`):**

```typescript
// GET: Return messages for the user's assignment
// - If user is giver: show messages where assignmentId matches and they can see all
// - Messages show only "Your Secret Santa" or "Your Gift Recipient" as sender name

// POST: Send message
// - Determine senderType based on current user's role in assignment
// - Create notification for recipient
```

---

## Phase 8: Event Coordination & History

Build event management, RSVP tracking, and historical data.

### Tasks

- [ ] Create Event API `src/app/api/groups/[groupId]/event/route.ts`
- [ ] Create RSVP API `src/app/api/groups/[groupId]/rsvp/route.ts`
- [ ] Create Activity API `src/app/api/groups/[groupId]/activity/route.ts`
- [ ] Create History API `src/app/api/history/route.ts`
- [ ] Create event page `src/app/groups/[groupId]/event/page.tsx`
- [ ] Create history page `src/app/history/page.tsx`
- [ ] Create EventForm component `src/components/events/event-form.tsx`
- [ ] Create EventCard component `src/components/events/event-card.tsx`
- [ ] Create RSVPButtons component `src/components/events/rsvp-buttons.tsx`
- [ ] Create RSVPList component `src/components/events/rsvp-list.tsx`
- [ ] Create GroupActivityFeed component `src/components/groups/group-activity-feed.tsx`
- [ ] Create ExchangeCard component for history `src/components/history/exchange-card.tsx`

### Technical Details

**Event API (`src/app/api/groups/[groupId]/event/route.ts`):**

```typescript
const eventSchema = z.object({
  locationName: z.string().max(200).optional(),
  locationAddress: z.string().max(500).optional(),
  virtualLink: z.string().url().optional(),
  eventNotes: z.string().max(1000).optional(),
});

// GET: Return event details + RSVPs with user info
// PATCH: Update event details (admin only), log activity, create notifications
```

**RSVP API (`src/app/api/groups/[groupId]/rsvp/route.ts`):**

```typescript
// POST: Create or update RSVP
// Returns updated RSVP list
```

**History API (`src/app/api/history/route.ts`):**

```typescript
// GET: Return all archived groups user participated in
// Include: group name, year, who they gave to, who gave to them, gift descriptions
```

---

## Phase 9: Polish & Landing Page

Final touches: update landing page, ensure responsiveness, and complete theming.

### Tasks

- [ ] Update landing page `src/app/page.tsx` with Secret Santa theme
- [ ] Add hero section with snowfall background
- [ ] Add feature highlights section
- [ ] Add "How it Works" section
- [ ] Ensure all pages are mobile responsive
- [ ] Verify dark mode works correctly throughout
- [ ] Add loading states with snowflake spinner
- [ ] Add empty states with festive illustrations
- [ ] Create custom 404 page with Christmas theme
- [ ] Final accessibility audit (ARIA labels, keyboard nav)

### Technical Details

**Landing Page Structure:**

```tsx
// Hero section with snowfall
<section className="relative min-h-screen bg-gradient-to-b from-christmas-red to-berry-red">
  <Snowfall />
  <div className="container mx-auto px-4 py-20 text-center text-white">
    <h1 className="font-nunito text-5xl font-bold">Secret Santa</h1>
    <p className="mt-4 text-xl">Create magical gift exchanges with friends and family</p>
    <SignInButton />
  </div>
</section>

// Features section
<section className="bg-cream dark:bg-pine-dark py-20">
  <FeatureCard icon={Gift} title="Easy Groups" />
  <FeatureCard icon={Shuffle} title="Fair Draw" />
  <FeatureCard icon={ListChecks} title="Wishlists" />
  <FeatureCard icon={Sparkles} title="AI Suggestions" />
</section>

// How it works
<section>
  <Step number={1} title="Create a Group" />
  <Step number={2} title="Invite Friends" />
  <Step number={3} title="Draw Names" />
  <Step number={4} title="Exchange Gifts" />
</section>
```

**Loading Spinner Component:**

```tsx
// Spinning snowflake SVG
<svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24">
  {/* Snowflake path */}
</svg>
```

---

## Summary

**Total Files to Create:**

- 12 database tables in schema
- ~15 API routes
- ~12 pages
- ~30 components

**Key Dependencies:**

- Additional shadcn/ui components (tabs, select, calendar, popover, etc.)
- Nunito font from Google Fonts

**Critical Path:**

1. Database schema (everything depends on this)
2. Group management (core feature)
3. Draw algorithm (main value prop)
4. Wishlists (enhances gift-giving)
5. AI suggestions (differentiator)
6. Theme/Polish (user experience)
