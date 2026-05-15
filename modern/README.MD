# EduManage Portal — Gym Tracking Application

## Overview

A web application for tracking gym workouts. Supports individual users logging personal training sessions, professional trainers managing client programs, and administrators overseeing the platform.

---

## Tech Stack

- **Frontend:** Vue 3 (Composition API), Tailwind CSS
- **Auth:** Auth0
- **State:** Pinia
- **Routing:** Vue Router

---

## User Roles

| Role | Description |
|---|---|
| `user` | Individual gym-goer managing their own workouts |
| `trainer` | Professional trainer managing clients and training plans |
| `admin` | Platform administrator with full oversight |

---

## Accounts & Authentication

- User registration and login via Auth0
- Role assigned at registration (user / trainer) or promoted by admin
- Profile page: display name, avatar, bio (trainers can make profile public)
- Password reset and email verification handled by Auth0

---

## Exercise Library

- Platform-wide default exercise database managed by admins
- Each exercise has: name, description, muscle groups targeted, equipment required, type (weighted / bodyweight / cardio)
- Trainers and users can create custom exercises (visible only to them)
- Search and filter exercises by name, muscle group, or equipment

---

## Workout Plans

- A workout plan contains one or more workout sessions (e.g. Day A, Day B)
- Each workout session contains an ordered list of exercises
- Each exercise entry in a session defines: sets, target reps, target weight (optional for bodyweight), rest time between sets (optional)
- Users can create their own plans
- Trainers create plans and assign them to specific clients
- Plans can be marked as template and reused
- Admins can create platform-wide default plans visible to all users

---

## Workout in Progress

When a user starts a planned workout session:

- Timer starts automatically and tracks total workout duration
- Exercises displayed one at a time in order, with clear indication of current position (e.g. Exercise 2 of 5)
- For each set: show target reps and weight, allow user to log actual reps and weight performed
- After marking a set as completed: countdown timer starts if rest time is defined; skip rest early is allowed
- Easy weight adjustment with automatic volume recalculation (sets × reps × weight) shown in real time
- User can reorder, skip, or add ad-hoc exercises mid-workout
- Workout can be paused and resumed
- On completion: summary screen showing total volume, duration, sets completed, and comparison to previous session

---

## Workout History & Progress Tracking

- Calendar view showing days with completed workouts
- Log of all past workout sessions with full details (exercises, sets, reps, weights, duration)
- Per-exercise progress charts: weight over time, volume over time
- Personal records (PRs) automatically detected and highlighted (heaviest weight, highest volume per exercise)
- Weekly and monthly volume summaries

---

## Trainer Features

- Dashboard showing all clients and their recent activity
- Invite clients via a shareable invite link (link is single-use or expires after a set time)
- View any client's full workout history and progress charts
- Assign, update, or revoke training plans for clients
- Leave notes or feedback on a client's completed workout session
- Toggle public profile visibility so clients can discover them

---

## Client Discovery (for Users)

- Browse list of trainers who have enabled public profiles
- View trainer's public profile: bio, specialisations, number of clients
- Request to connect with a trainer (trainer approves or declines)

---

## Admin Features

- View all registered users (filter by role: user / trainer)
- Promote or demote user roles
- Manage platform-wide exercise library (create, edit, deactivate exercises)
- Manage platform-wide default workout plan templates
- View high-level platform stats: total users, active workouts today, signups over time

---

## Notifications

- In-app notification bell for: trainer feedback on session, new client request, invite accepted
- Email notifications for the above (configurable per user in settings)

---

## Non-Functional Requirements

- Fully responsive — optimised for mobile use during a workout (large tap targets, readable in gym lighting)
- Offline-tolerant workout logging: in-progress workout data saved to local storage so a lost connection does not lose data
- All forms validate inline with clear error messages
- Loading states and skeleton screens for data-fetching views
- Accessible: keyboard navigable, sufficient colour contrast

---

## Out of Scope (v1)

- Native mobile app
- Nutrition / diet tracking
- Video demonstrations for exercises
- In-app messaging between trainer and client
- Payments / subscriptions for trainer services
