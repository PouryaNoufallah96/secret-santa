import * as schema from "./schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Select types (for reading from database)
export type User = InferSelectModel<typeof schema.user>;
export type Session = InferSelectModel<typeof schema.session>;
export type Account = InferSelectModel<typeof schema.account>;
export type Verification = InferSelectModel<typeof schema.verification>;
export type UserProfile = InferSelectModel<typeof schema.userProfile>;
export type Group = InferSelectModel<typeof schema.group>;
export type GroupMember = InferSelectModel<typeof schema.groupMember>;
export type ExclusionRule = InferSelectModel<typeof schema.exclusionRule>;
export type Assignment = InferSelectModel<typeof schema.assignment>;
export type WishlistItem = InferSelectModel<typeof schema.wishlistItem>;
export type Notification = InferSelectModel<typeof schema.notification>;
export type AnonymousMessage = InferSelectModel<typeof schema.anonymousMessage>;
export type GroupActivity = InferSelectModel<typeof schema.groupActivity>;
export type EventDetails = InferSelectModel<typeof schema.eventDetails>;
export type Rsvp = InferSelectModel<typeof schema.rsvp>;
export type GiftHistory = InferSelectModel<typeof schema.giftHistory>;

// Insert types (for creating new records)
export type NewUserProfile = InferInsertModel<typeof schema.userProfile>;
export type NewGroup = InferInsertModel<typeof schema.group>;
export type NewGroupMember = InferInsertModel<typeof schema.groupMember>;
export type NewExclusionRule = InferInsertModel<typeof schema.exclusionRule>;
export type NewAssignment = InferInsertModel<typeof schema.assignment>;
export type NewWishlistItem = InferInsertModel<typeof schema.wishlistItem>;
export type NewNotification = InferInsertModel<typeof schema.notification>;
export type NewAnonymousMessage = InferInsertModel<typeof schema.anonymousMessage>;
export type NewGroupActivity = InferInsertModel<typeof schema.groupActivity>;
export type NewEventDetails = InferInsertModel<typeof schema.eventDetails>;
export type NewRsvp = InferInsertModel<typeof schema.rsvp>;
export type NewGiftHistory = InferInsertModel<typeof schema.giftHistory>;

// Extended types for common queries
export type GroupWithMembers = Group & {
  members: (GroupMember & { user: User })[];
  memberCount: number;
};

export type GroupWithDetails = Group & {
  members: (GroupMember & { user: User })[];
  eventDetails: EventDetails | null;
  memberCount: number;
};

export type AssignmentWithUsers = Assignment & {
  giver: User;
  receiver: User;
};

export type WishlistItemWithUser = WishlistItem & {
  user: User;
};

export type NotificationWithGroup = Notification & {
  group: Group | null;
};

export type GroupActivityWithUser = GroupActivity & {
  user: User | null;
};

export type RsvpWithUser = Rsvp & {
  user: User;
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

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  CAD: "C$",
  AUD: "A$",
  JPY: "\u00A5",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
};

// Notification types
export type NotificationType =
  | "assignment_ready"
  | "new_member"
  | "draw_complete"
  | "message"
  | "reminder"
  | "wishlist_update"
  | "event_update";

// Activity types
export type ActivityType =
  | "member_joined"
  | "draw_completed"
  | "event_updated"
  | "wishlist_added"
  | "redraw_triggered";

// RSVP status
export type RsvpStatus = "attending" | "not_attending" | "maybe";

// Group member role
export type GroupMemberRole = "admin" | "member";

// Wishlist priority
export type WishlistPriority = "low" | "medium" | "high";

// Message sender type
export type MessageSenderType = "santa" | "recipient";
