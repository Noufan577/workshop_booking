# Workshop Booking Portal (UI/UX Redesign)

> This website is for coordinators to book a workshop(s). They can book a workshop based on instructors' posts or propose a workshop date based on their convenience.

### Features
* **Statistics**
    1. **Instructors Only**
        * Monthly Workshop Count
        * Instructor/Coordinator Profile stats
        * Upcoming Workshops
        * View/Post comments on Coordinator's Profile
    2. **Open to All**
        * Workshops taken over Map of India
        * Pie chart based on Total Workshops taken to Type of Workshops.

* **Workshop Features**
    > Instructors can Accept, Reject or Delete workshops based on their preference. They can also postpone a workshop based on coordinator requests.

__NOTE__: Check `docs/Getting_Started.md` for local setup instructions.

---

## Technical Reasoning & Implementation

**1. What design principles guided your improvements?**  
Honestly, my main goal was to move away from the traditional, rigid dataset look and make it feel more like a modern app. I focused heavily on a "mobile-first" approach since most people prefer checking their status on their phones. I also focused primarily on reducing cognitive load—instead of showing users a massive wall of text or 20 form fields at once, I broke forms down into bite-sized step-cards so they don’t get overwhelmed. I stuck to a cohesive, high-contrast visual hierarchy (Academic Amber and Navy) to make buttons and active states obvious without cluttering the screen.

**2. How did you ensure responsiveness across devices?**  
Instead of just squishing everything down, I changed the core navigation flow based on the device. For mobile devices, I completely hid the top header navigation and replaced it with a fixed bottom navigation bar—this makes all the core pages fully thumb-friendly. To handle different screen sizes dynamically, I used CSS Flexbox and Grid extensively, and applied `clamp()` functions for fluid typography so text gracefully scales down between desktop and mobile rather than awkwardly breaking.

**3. What trade-offs did you make between the design and performance?**  
To keep load times fast on weak mobile networks, I made a strict decision to drop heavy CSS frameworks (like Bootstrap or Tailwind) and heavy UI component libraries (like Material UI). The major trade-off here was development time—I had to write the entire design system and animations in pure vanilla CSS (`index.css`), which took significantly longer. I also decided to paste SVGs inline inside the React components instead of loading external icon fonts. It makes the code slightly longer, but the performance payoff of zero extra network requests is huge.

**4. What was the most challenging part of the task and how did you approach it?**  
The hardest part was definitely converting the long, complex Django-rendered forms (especially the Propose Workshop phase) into the new modern React Single Page Application flow. Managing the complex state of a multi-step form was tricky. I approached it by storing a simple `step` integer in the state and conditionally mapping out sections as cards. Once the user filled a card, it unlocked the next one, providing a sense of momentum. Getting the 3D mouse-tracking tilt effect to work smoothly on the Workshop Catalogue cards was also surprisingly challenging regarding math and event listeners, but the final premium feel was totally worth the effort.
