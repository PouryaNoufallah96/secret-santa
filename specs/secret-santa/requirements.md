# Requirements: Secret Santa Application

## Overview

A full-featured Secret Santa web application that allows users to create gift exchange groups, invite friends, manage wishlists, and receive AI-powered gift suggestions. The app features a festive Christmas theme with snowfall effects.

## Goals

1. **Simplify Secret Santa coordination** - Replace spreadsheets and manual draws with an automated, fair system
2. **Enhance gift-giving experience** - Help users find perfect gifts through wishlists and AI suggestions
3. **Create festive atmosphere** - Deliver a delightful, Christmas-themed user experience
4. **Enable global participation** - Support multiple currencies for international groups

## User Stories

### Group Management
- As a user, I can create a Secret Santa group with a name, budget range, and exchange date
- As a user, I can share an invite link/code with friends to join my group
- As a user, I can join a group using an invite code
- As a group admin, I can manage group settings and remove members
- As a group admin, I can set exclusion rules (e.g., couples shouldn't draw each other)

### Secret Santa Draw
- As a group admin, I can trigger the Secret Santa draw when ready
- As a participant, I can view my assignment (who I'm buying for) without seeing others' assignments
- As a group admin, I can trigger a re-draw if needed before the exchange date
- As a participant, I experience an animated "gift unwrapping" reveal

### Wishlist System
- As a user, I can create wishlists with gift ideas (name, description, link, price, priority)
- As a user, I can have a global wishlist and group-specific wishlists
- As a Secret Santa, I can view my assigned person's wishlist
- As a Secret Santa, I can mark items as purchased (only visible to me, not the recipient)

### AI Gift Suggestions
- As a Secret Santa, I can get AI-powered gift suggestions based on my recipient's interests and wishlist
- As a user, I can add interest tags to my profile for better suggestions
- As a Secret Santa, I see budget-aware recommendations within the group's budget range

### Communication
- As a Secret Santa, I can send anonymous messages to my recipient (without revealing my identity)
- As a recipient, I can reply to my Secret Santa anonymously
- As a user, I receive in-app notifications for important events

### Event Coordination
- As a group admin, I can set exchange event details (location, virtual link)
- As a participant, I can RSVP to the exchange event
- As a participant, I can see who's attending

### History
- As a user, I can view past Secret Santa exchanges I've participated in
- As a user, I can see gift history (what I gave/received)

## Functional Requirements

### Authentication
- Google OAuth sign-in (using existing Better Auth setup)
- Session-based authentication with automatic refresh
- Protected routes require authentication

### Groups
- Unique 8-character alphanumeric invite codes (e.g., "SANTA24X")
- Support for multiple currencies (USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK)
- Budget range (min/max) per group
- Admin role for group creator (can promote others)
- Archive groups instead of delete (preserve history)

### Draw Algorithm
- Random assignment ensuring no self-assignments
- Support exclusion rules (mutual - A can't have B means B can't have A)
- Validate feasibility before draw (error if exclusions make it impossible)
- Track draw rounds for re-draws
- Maximum 100 shuffle attempts before declaring impossible

### Notifications
- In-app notification center
- Notification types: assignment ready, new member joined, draw complete, message received, event updates
- Mark as read functionality
- Unread count indicator in header

### Theme
- Christmas color palette (reds, greens, golds)
- Snowfall particle effect (performance-optimized, respects prefers-reduced-motion)
- Dark mode with winter night atmosphere
- Light mode with warm cozy feel
- Playful rounded typography (Nunito font)

## Non-Functional Requirements

### Performance
- Snowfall animation uses requestAnimationFrame
- Database indexes on frequently queried columns
- Lazy loading for large member lists

### Accessibility
- Respects prefers-reduced-motion for animations
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast

### Security
- Server-side session validation on all protected routes
- Input validation with Zod schemas
- No exposure of other users' assignments
- Anonymous messages don't leak sender identity

### Responsiveness
- Mobile-first design
- Touch-friendly buttons and interactions
- Responsive layouts for all screen sizes

## Technical Constraints

- Built on existing Next.js 16 boilerplate
- PostgreSQL database with Drizzle ORM
- Better Auth for authentication (Google OAuth only)
- OpenRouter for AI features (existing integration)
- shadcn/ui components with Tailwind CSS 4

## Acceptance Criteria

1. Users can create groups and invite friends via shareable codes
2. Secret Santa draw produces fair, random assignments respecting exclusions
3. Users can only see their own assignment (secrecy maintained)
4. Wishlists support add/edit/delete with purchase tracking
5. AI suggestions are relevant and budget-aware
6. Anonymous messaging preserves identity of Secret Santa
7. Snowfall effect is visible and performant
8. App works on mobile devices
9. Both light and dark modes have festive Christmas themes
10. All prices display in the group's selected currency

## Dependencies

- Existing Better Auth setup (Google OAuth configured)
- Existing OpenRouter integration (AI chat endpoint)
- PostgreSQL database connection
- shadcn/ui component library
