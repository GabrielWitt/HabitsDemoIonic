# HabitsApp — Health & Habits Mobile Demo

> **Demo build** — disconnected from production backend. For portfolio and demonstration purposes only.

A cross-platform mobile application for personal health habit tracking, built with Ionic and integrated with Firebase and native device APIs.

---

## Overview

HabitsApp is a production-grade mobile application that allows users to track daily health habits, visualize progress over time, and receive intelligent reminders to stay consistent.

This repository showcases a real-world Ionic architecture with deep native integration: health data, camera, local notifications, offline storage, and real-time Firebase sync.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Ionic 3 · Angular 5 |
| Language | TypeScript |
| Backend | Firebase (Auth · Firestore · Cloud Functions) |
| Native APIs | Cordova · Ionic Native |
| State | RxJS 6 · Ionic Storage |
| Charts | Chart.js |
| Styling | SCSS · Ionicons |

---

## Key Features & Integrations

**Health Data**
- Native health platform integration (Apple Health / Google Fit) via `cordova-plugin-health`
- Real-time habit progress tracking with Chart.js visualizations

**Notifications & Engagement**
- Local push notifications with wake-up timer for habit reminders
- Badge count updates on app icon
- Social sharing of progress milestones

**Media & Storage**
- Camera integration with image crop and local file caching
- Offline-first architecture using SQLite + Ionic Storage
- Image lazy loading with local cache management

**Firebase Integration**
- Firebase Auth for user sessions
- Firestore for real-time data sync
- Firebase Cloud Messaging via `cordova-plugin-firebasex`
- Cloud Functions for backend logic

**UX Details**
- Particle effect animations on habit completion
- Confetti celebration on milestones
- Moment.js for date/time formatting
- Cross-platform: iOS · Android · Browser

---

## Architecture Highlights

- Modular Angular service layer separating business logic from UI
- RxJS-based reactive data streams for real-time updates
- Lazy-loaded pages for performance optimization
- Cordova plugin abstraction via Ionic Native wrappers
- TypeScript strict typing throughout

---

## Project Structure

```
src/
├── app/          # App module, root component, routing
├── pages/        # Lazy-loaded page components
├── providers/    # Services: auth, habits, health, notifications
├── components/   # Reusable UI components
└── assets/       # Static assets
```

---

## Running the Demo

> Note: Native plugins require a physical device or emulator. Browser mode has limited functionality.

```bash
# Install dependencies
npm install

# Run in browser (limited native features)
ionic serve

# Run on device
ionic cordova run android
ionic cordova run ios
```

---

## About This Demo

This is a sanitized version of a production application, with backend credentials removed and server connections disabled. The codebase demonstrates real-world patterns used in a live mobile product.

---

## Author

**Gabriel Witt** · Full Stack Engineer · Frontend & Mobile Specialized  
[LinkedIn](https://linkedin.com/in/gabriel-witt) · [GitHub](https://github.com/GabrielWitt) · [Portfolio](https://portafoliogabrodev.web.app)
