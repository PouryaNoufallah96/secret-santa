import { db } from "@/lib/db";
import { notification } from "@/lib/schema";

export type NotificationType =
  | "assignment_ready"
  | "new_member"
  | "draw_complete"
  | "message"
  | "reminder"
  | "wishlist_update"
  | "event_update";

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  relatedGroupId?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  return db
    .insert(notification)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      linkUrl: data.linkUrl || null,
      relatedGroupId: data.relatedGroupId || null,
    })
    .returning();
}

/**
 * Create notifications for multiple users at once
 */
export async function createNotificationsForUsers(
  userIds: string[],
  notificationData: Omit<CreateNotificationData, "userId">
) {
  if (userIds.length === 0) return [];

  const notifications = userIds.map((userId) => ({
    userId,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    linkUrl: notificationData.linkUrl || null,
    relatedGroupId: notificationData.relatedGroupId || null,
  }));

  return db.insert(notification).values(notifications).returning();
}

/**
 * Notify all members of a group about a draw completion
 */
export async function notifyDrawComplete(
  memberUserIds: string[],
  groupId: string,
  groupName: string
) {
  return createNotificationsForUsers(memberUserIds, {
    type: "draw_complete",
    title: "Secret Santa Draw Complete!",
    message: `Names have been drawn in ${groupName}. Check out who you got!`,
    linkUrl: `/groups/${groupId}/assignment`,
    relatedGroupId: groupId,
  });
}

/**
 * Notify a user that their assignment is ready
 */
export async function notifyAssignmentReady(
  userId: string,
  groupId: string,
  groupName: string
) {
  return createNotification({
    userId,
    type: "assignment_ready",
    title: "Your Assignment is Ready!",
    message: `You've been assigned someone in ${groupName}. Click to reveal!`,
    linkUrl: `/groups/${groupId}/assignment`,
    relatedGroupId: groupId,
  });
}

/**
 * Notify group admin when a new member joins
 */
export async function notifyNewMember(
  adminUserIds: string[],
  memberName: string,
  groupId: string,
  groupName: string
) {
  return createNotificationsForUsers(adminUserIds, {
    type: "new_member",
    title: "New Member Joined",
    message: `${memberName} has joined ${groupName}`,
    linkUrl: `/groups/${groupId}`,
    relatedGroupId: groupId,
  });
}

/**
 * Notify user of a new anonymous message
 */
export async function notifyNewMessage(
  userId: string,
  groupId: string,
  groupName: string,
  isFromSanta: boolean
) {
  return createNotification({
    userId,
    type: "message",
    title: isFromSanta
      ? "New message from your Secret Santa!"
      : "New message from your gift recipient!",
    message: `You have a new anonymous message in ${groupName}`,
    linkUrl: `/groups/${groupId}/messages`,
    relatedGroupId: groupId,
  });
}

/**
 * Notify user about wishlist updates from their recipient
 */
export async function notifyWishlistUpdate(
  userId: string,
  groupId: string,
  groupName: string,
  recipientName: string
) {
  return createNotification({
    userId,
    type: "wishlist_update",
    title: "Wishlist Updated",
    message: `${recipientName} has updated their wishlist in ${groupName}`,
    linkUrl: `/groups/${groupId}/wishlist`,
    relatedGroupId: groupId,
  });
}

/**
 * Notify members about event updates
 */
export async function notifyEventUpdate(
  memberUserIds: string[],
  groupId: string,
  groupName: string
) {
  return createNotificationsForUsers(memberUserIds, {
    type: "event_update",
    title: "Event Details Updated",
    message: `The exchange event details have been updated in ${groupName}`,
    linkUrl: `/groups/${groupId}/event`,
    relatedGroupId: groupId,
  });
}

/**
 * Send a reminder notification
 */
export async function notifyReminder(
  userId: string,
  title: string,
  message: string,
  linkUrl?: string,
  groupId?: string
) {
  const data: CreateNotificationData = {
    userId,
    type: "reminder",
    title,
    message,
  };

  if (linkUrl !== undefined) {
    data.linkUrl = linkUrl;
  }

  if (groupId !== undefined) {
    data.relatedGroupId = groupId;
  }

  return createNotification(data);
}
