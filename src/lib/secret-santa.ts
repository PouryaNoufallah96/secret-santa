import type { Currency } from "./types";

/**
 * Generate a unique 8-character invite code for groups
 * Uses characters that are easy to read and type (no O/0, I/1/l confusion)
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Format a price in cents to a currency string
 */
export function formatPrice(cents: number, currency: Currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Format a date for display as an exchange date
 */
export function formatExchangeDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format a date for short display
 */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  } else if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, "minute");
  } else {
    return rtf.format(diffSecs, "second");
  }
}

/**
 * Generate Secret Santa assignments using a derangement algorithm
 * Returns a Map of giver -> receiver, or null if impossible
 */
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
      const valid = validReceivers
        .get(giver)!
        .filter((r) => !usedReceivers.has(r));
      if (valid.length === 0) {
        success = false;
        break;
      }
      const receiver = valid[Math.floor(Math.random() * valid.length)]!;
      assignments.set(giver, receiver);
      usedReceivers.add(receiver);
    }

    if (success && usedReceivers.size === n) {
      return assignments;
    }
  }

  return null; // Could not find valid assignment
}

/**
 * Validate if a valid assignment is possible with the given exclusions
 */
export function canGenerateAssignments(
  memberIds: string[],
  exclusions: Map<string, Set<string>>
): boolean {
  // Quick check: each person must have at least one valid receiver
  for (const giver of memberIds) {
    const excluded = exclusions.get(giver) || new Set();
    const validCount = memberIds.filter(
      (r) => r !== giver && !excluded.has(r)
    ).length;
    if (validCount === 0) return false;
  }

  // Try to generate - if it works, it's possible
  const result = generateAssignments(memberIds, exclusions);
  return result !== null;
}

/**
 * Build a mutual exclusion map from exclusion rules
 * If A excludes B, then B also excludes A
 */
export function buildExclusionMap(
  rules: { userId: string; excludedUserId: string }[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const rule of rules) {
    // Add A -> B exclusion
    if (!map.has(rule.userId)) {
      map.set(rule.userId, new Set());
    }
    map.get(rule.userId)!.add(rule.excludedUserId);

    // Add B -> A exclusion (mutual)
    if (!map.has(rule.excludedUserId)) {
      map.set(rule.excludedUserId, new Set());
    }
    map.get(rule.excludedUserId)!.add(rule.userId);
  }

  return map;
}

/**
 * Calculate days until a date
 */
export function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if an exchange date has passed
 */
export function hasExchangeDatePassed(exchangeDate: Date | null): boolean {
  if (!exchangeDate) return false;
  return new Date() > exchangeDate;
}

/**
 * Get a greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate an invite code format
 */
export function isValidInviteCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
}

/**
 * Parse price input to cents
 */
export function parsePriceToCents(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}
