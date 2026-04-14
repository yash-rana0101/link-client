# Client Smoke Test Checklist

## 1) Setup

- Install dependencies: `pnpm install`
- Set env values in `.env.local` from `.env.example`
- Start backend API at `http://localhost:4000`
- Start frontend: `pnpm dev`

## 2) Authentication

- Open `/login`
- Log in with a valid user
- Confirm redirect to `/feed`
- Refresh page and verify session remains active
- Click logout and verify redirect to `/login`

## 3) Route Protection

- As logged-out user, attempt `/feed`, `/profile`, `/connections`, `/verification`
- Verify redirect to `/login`
- As logged-in user, open `/login` and `/signup`
- Verify redirect to `/feed`

## 4) Feed

- Create a new post and verify it appears in feed
- Like the post and verify count updates
- Add comment and verify count updates
- Scroll feed and verify infinite loading occurs

## 5) Profile

- Open `/profile`
- Verify trust score, skills, experiences, and completion meter render
- Verify profile card and experience cards load without errors

## 6) Connections

- Open `/connections`
- Submit a connection request using a valid receiver user ID
- Verify pending requests list renders
- Accept or reject a pending request
- Remove an accepted connection

## 7) Verification

- Open `/verification`
- Select an experience
- Select one or more accepted connections as verifiers
- Request verification and verify status panel updates
- If current user is assigned verifier, approve/reject and verify status changes

## 8) Messaging Realtime

- Open `/messaging`
- Send a message to a valid connection conversation
- Verify message appears in thread immediately
- Verify incoming message appears without full page refresh

## 9) Notifications Realtime

- Trigger an event that generates notifications (connection/message/post/job)
- Verify notification badge count updates
- Open dropdown and mark item as read
- Verify read state persists on reload

## 10) Jobs

- Open `/jobs`
- Search job list with keyword
- Apply to a job and verify no client errors
- Reload and verify list still loads

## 11) Build/Quality

- Run `pnpm lint` and ensure no lint errors
- Run `pnpm build` and ensure production build succeeds
