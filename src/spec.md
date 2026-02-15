# Specification

## Summary
**Goal:** Require a one-time $0.50 payment to unlock access to the hydration tracker, with backend enforcement and a frontend paywall experience tied to the user’s Internet Identity Principal.

**Planned changes:**
- Add backend storage of a per-Principal paid/unlocked flag and an API to query the caller’s current unlock status.
- Enforce paid access in the backend by rejecting `recordIntake` and `getWeeklySummary` calls for locked users with a clear “payment required” error/result.
- Implement a $0.50 payment flow that requires Internet Identity login, marks the authenticated user as unlocked on successful payment, and persists unlock state across reloads.
- Add a frontend paywall screen/overlay that blocks Daily Log and Weekly Summary until unlocked, includes login + payment CTA, and displays clear English status/error messaging; handle backend payment-required errors by showing the paywall.

**User-visible outcome:** Users must sign in and pay $0.50 to unlock the app; once unlocked, they can record water intake and view weekly summaries normally, and unpaid users see a clear paywall instead of the tracker UI.
