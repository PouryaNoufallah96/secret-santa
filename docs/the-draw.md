# The Secret Santa Draw

This guide explains how the Secret Santa draw works and how to manage it.

## How the Draw Works

The draw randomly assigns each participant to another participant. Our algorithm ensures:

- **Everyone gives one gift** - Each person is assigned exactly one recipient
- **Everyone receives one gift** - Each person is assigned exactly one Santa
- **No self-assignments** - You'll never draw your own name
- **Exclusions respected** - Certain pairs can be prevented from matching

## Requirements for the Draw

Before running the draw, you need:

- **At least 2 members** in the group
- **Admin privileges** (only admins can run the draw)
- **Valid exclusion setup** (if any rules would make the draw impossible, you'll be warned)

## Running the Draw (Admins Only)

### Step 1: Navigate to the Draw Page

1. Go to your group dashboard
2. Click **Draw Names** or navigate to the draw page

### Step 2: Review the Setup

Before drawing, check:
- All expected members have joined
- Exclusion rules are set correctly
- The member count is correct

### Step 3: Initiate the Draw

1. Click **Draw Names**
2. Confirm the action
3. Wait for the algorithm to complete

### Step 4: Notify Members

Once complete:
- All members receive a notification
- The draw date is recorded
- Members can now view their assignments

## Exclusion Rules

Exclusion rules prevent certain people from being matched. Common uses:

- Spouses/couples who already exchange gifts
- Siblings who want to mix things up
- People who were matched last year

### Setting Up Exclusions (Admins Only)

1. Go to the draw page before running the draw
2. Find the **Exclusion Rules** section
3. Select two members who shouldn't be matched
4. Optionally add a reason (e.g., "Married couple")
5. Click **Add Exclusion**

### Important Notes About Exclusions

- **Exclusions are mutual** - If A can't draw B, then B can't draw A
- **Don't over-exclude** - Too many rules can make the draw impossible
- **Plan ahead** - Exclusions must be set before the draw

### Exclusion Limits

Be careful not to create too many exclusions. The system will warn you if:
- The exclusions make a valid draw impossible
- Someone has no valid recipients

## Viewing Your Assignment

After the draw:

1. Go to your group dashboard or draw page
2. Find the **Your Assignment** section
3. Click to reveal (a blur protects against accidental reveals)
4. You'll see:
   - Your recipient's name and avatar
   - Their email (for emergencies)
   - The budget range
   - Links to their wishlist
   - Link to AI suggestions

## What You Can Do After the Draw

### As a Santa
- View your recipient's wishlist
- Send anonymous messages
- Get AI gift suggestions
- Mark items as purchased

### As a Recipient
- Keep updating your wishlist
- Send messages to your Santa
- RSVP to the event

## Resetting the Draw (Admins Only)

If needed, admins can reset the draw before the exchange date:

1. Go to the draw page
2. Click **Reset Draw**
3. Confirm the action

After resetting:
- All assignments are deleted
- The draw status resets to "incomplete"
- You can modify exclusions
- Run a new draw

**Note:** You cannot reset after the exchange date has passed.

## The Algorithm

Our draw uses a **derangement algorithm** that:

1. Shuffles all participants
2. Attempts to create valid assignments
3. Checks each assignment against exclusion rules
4. Ensures no one draws themselves
5. Retries if a valid solution isn't found (up to 100 attempts)

This ensures a mathematically fair and random result every time.

## Troubleshooting

### "Cannot complete draw" error
- Check if exclusion rules are too restrictive
- Ensure you have at least 2 members
- Try removing some exclusions

### Member didn't get their assignment
- They need to sign in and visit the group
- Notifications are sent automatically
- They can always view it on the draw page

### Wrong person assigned
- Admins can reset and redraw
- Double-check exclusion rules were set correctly

## Next Steps

After the draw:

- [View your recipient's wishlist](./wishlists.md)
- [Send anonymous messages](./messaging.md)
- [Get AI gift suggestions](./ai-suggestions.md)
- [Set up the event](./events.md)
