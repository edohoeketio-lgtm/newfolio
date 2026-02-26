# Maurice — Interactive Designer & Developer Portfolio

A high-performance, minimalist portfolio built to showcase interactive engineering, motion design, and world-class UX. This repository contains the source code for my personal portfolio, acting as a functional demonstration of my frontend capabilities.

## Key Features & Architecture

This portfolio eschews bloated frameworks in favor of a lean, highly optimized Vanilla JS and Native CSS architecture. It is designed to be **weirdly good software, built fast**.

* **Zero-Dependency Core:** Built using standard HTML, CSS, and Vanilla JavaScript for maximum performance and a microscopic bundle size.
* **Hardware-Accelerated Animation:** Uses pure CSS transitions and requestAnimationFrame for 60fps scrolling and parallax effects without reliance on heavy libraries like GSAP or Framer Motion.
* **3D Parallax Tilt:** Custom mathematics calculate mouse proximity to drive a dynamic, 3D CSS perspective transformation on the hero typography.
* **Bi-Directional Scroll Jacking:** A sophisticated scroll event accumulator creates a seamless, app-like transition between the Hero and Projects sections based on user intent (tracking deltaY over time to prevent accidental skips).
* **Lazy-Loaded Embedded Applications:** Projects (like the *XTC Radio* audio engine and the *shp.it* developer utility) are embedded via responsive `iframes`. The DOM dynamically assigns `src` attributes via Intersection Observers only when the projects section is activated, preventing wasted initial load bandwidth.
* **Mobile-First Responsive Design:** Advanced `clamp()` functions and CSS Grid/Flexbox ensure the complex layering and typography remain mathematically perfect across all viewports (from 375px mobile to 4K ultrawide).

## The Build Process

### Local Development

The environment is powered by **Vite** for instantaneous Hot Module Replacement (HMR).

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

### Structure

* `index.html`: The semantic core and layout structure.
* `style.css`: Contains all visual styling, CSS variables, keyframe animations, and z-index layering (Hero video beneath typography, Projects sliding over the Hero).
* `main.js`: Handles the JavaScript logic including the 3D mouse tracking, scroll accumulation thresholds, and iframe hydration.

### 01 - XTC Radio

A real-time audio engine built from scratch. Features a dual-player crossfade system, Web Audio API signal chain with parametric EQ, and shuffle queue algorithms.
Demo: <https://e-town-radio.vercel.app/>

### 02 - shp.it

A native utility allowing developers to share their localhost instantly. The embed highlights the underlying tech: Next.js 14, WebSocket tunneling, and end-to-end encryption.
Demo: <https://shpit.vercel.app/#>

---
*Designed and engineered by Maurice Edohoeket.*
