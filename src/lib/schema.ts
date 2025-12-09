import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

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
    hasViewedAssignment: boolean("has_viewed_assignment")
      .default(false)
      .notNull(),
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
    relatedGroupId: uuid("related_group_id").references(() => group.id, {
      onDelete: "cascade",
    }),
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
    status: text("status", {
      enum: ["attending", "not_attending", "maybe"],
    }).notNull(),
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
