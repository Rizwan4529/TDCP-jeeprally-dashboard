# Team invite notifications — design

Date: 2026-10-08
Scope: sub-project 1 of the team/co-driver rework (invitee side only). Team creation
with invites and the registration gate are a separate sub-project.

## Goal

A co-driver (a competitor who already has an account) sees team invites sent to them,
gets told when a new one arrives, and accepts or declines it in-app. Accepting is
immediate; registration is blocked elsewhere until the co-driver's profile is complete.

## API (only these calls)

- `GET /teams/invites` — all invites for the logged-in user, newest first, every status.
- `POST /teams/invites/:inviteId/accept`
- `POST /teams/invites/:inviteId/decline`

Use the top-level invite `_id`. `team_id.event_id` is only an id — no rally lookup is made.

## Units

| File | Responsibility |
| --- | --- |
| `src/api/types/team-invites.ts` | `TeamInvite`, `TeamInviteStatus`, response types |
| `src/api/services/team-invites.ts` | `getMyInvites`, `acceptInvite`, `declineInvite` (backend `message` surfaced as `Error`) |
| `src/hooks/api/use-team-invites.ts` | list query (5 min `refetchInterval`, refetch on focus) + accept/decline mutations (invalidate invites and `teams.all`) |
| `src/utils/invite-notifications.ts` | per-user "seen invite ids" store (localStorage, try/catch, subscribable) + helpers |
| `src/components/notifications/InviteNotificationsWatcher.tsx` | mounted in `SidebarLayout`; diffs each fetch against the previous one and toasts new pending invites |
| `src/pages/Notifications.tsx` | `/notifications` page |

## Behaviour

- **Polling:** list refetches every 5 minutes while the tab is visible, plus on window focus.
- **Toast:** after each fetch, any *pending* invite id not present in the previous result
  toasts "‹driver› invited you to join ‹team› (#‹number›)" with a **View** action. The first
  fetch after mount only sets the baseline (no toasts).
- **Red dot:** sidebar "Notifications" item shows a red dot when a pending invite id is not in
  the user's seen set. Visiting `/notifications` marks every current invite as seen. Seen ids are
  stored per user id; if storage is unavailable the dot simply reappears.
- **Page:** "Pending" cards (inviting driver, team name/number, category, sent date, Accept /
  Decline — decline confirms in a dialog; buttons disabled while a mutation runs) then
  "History" (accepted / declined / cancelled, read-only status pill). Loading, empty and error
  states use the shared components.
- **Profile banner:** when the user has an accepted invite and their own profile has gaps
  (`getCompetitorProfileGaps`), a banner lists the missing fields and links to Profile edit.
- **Errors:** backend `message` toasted; the list is refetched so stale cards disappear.

## Out of scope

Team creation / sending invites, registration gating, other notification types, push/websockets.
