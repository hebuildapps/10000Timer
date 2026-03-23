# 10000Timer ⏳
A gorgeously minimalistic, offline-first Focus Timer desktop application built with plain HTML, CSS, JavaScript, and packaged seamlessly with Electron. 

## ✨ Features

- **Core Timers**: Focus (25m), Short Break (5m), Long Break (15m), and Animedoro (50m) modes.
- **Dynamic Circular Progress**: Tracks your ongoing session with a smooth, reversing 100%-to-0% circular dash array.
- **Discord-Style Ambient Soundboard**: A built-in soundboard featuring completely procedurally-generated (Web Audio API) ambient tracks:
  - 🌬️ [ Wind ]
  - 🌧️ [ Rain ]
  - 🔥 [ Fireplace ]
  - ☕ [ Cafe ] 
  _Includes individual manual volume slider controls for each track._
- **Zen Mode**: An entirely distraction-free screen overlaying a fullscreen, real-time animated ASCII background (Fire or Rain) with a gorgeous glowing countdown. Zen mode perfectly syncs with your ongoing session timer's state (playing/paused/timeLeft).
- **Daily Tasks & Settings**: A lightweight daily to-do tracker synced to localStorage, alongside global app settings for master volume and resets.
- **Aesthetic**: Premium, sleek `#0a0a0a` dark mode styling with smooth CSS transitions and minimal SVG iconography.

## 🛠️ Tech Stack

- **Framework**: Electron (100% Offline Wrapper)
- **Frontend**: Plain HTML, Vanilla JS, and Vanilla CSS (No React, No bundlers, No external CDNs)
- **Audio**: Native Web Audio API (`AudioContext`, `createBiquadFilter`, `createOscillator`)
- **Animation**: `requestAnimationFrame` + `fs.readFileSync` for ASCII payload delivery, did ascii conversion frame-by-frame of few 5s videos using python pillow library.

## 🚀 Running the App

First, make sure you have Node installed.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run this app in Development**
   ```bash
   npm start
   ```
   _This spins up the Electron executable locally._

3. **Build executable (.exe)**
   ```bash
   npm run dist
   ```
   _This invokes `electron-builder` to package your app into a standalone `.exe` installer under the `dist/` directory, while embedding all necessary ASCII assets securely._

## 📂 Project Structure

```text
10000Timer/
├── assets/
│   └── frames/               // ASCII text frame sequences for Zen mode
│       ├── fire/
│       └── rain/
├── src/
│   ├── asciiPlayer.js        // Core animation class powering the Zen backgrounds
│   └── zenTimer.js           // Sync logic and state bridging for Zen mode
├── demo.html                 // Main interface and functionality wrapper
├── zen.html                  // The isolated Zen mode fullscreen view
├── main.js                   // Electron lifecycle manager (contextIsolation: false)
└── package.json
```

## 💡 Philosophy

Malcolm Gladwell's 10,000 hours rule is simple mastery of anything demands deliberate, logged time. 10000Timer was built as a personal tool to take that seriously: a distraction-free, offline-first focus timer that doesn't just count down, but tracks the grind toward something.
The roadmap goes further: synced sessions, more coming. The kind of thing you build while using it to build itself.