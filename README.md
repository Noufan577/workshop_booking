<img width="1917" height="972" alt="image" src="https://github.com/user-attachments/assets/5debee01-ee94-4968-b093-4619f5dcc77b" />

<img width="1918" height="971" alt="image" src="https://github.com/user-attachments/assets/74608f20-4328-4093-a68d-5e9b1687cfac" />

<img width="1899" height="966" alt="image" src="https://github.com/user-attachments/assets/c507d479-142a-4fa5-b535-85af4d2a681e" />

<img width="1917" height="959" alt="image" src="https://github.com/user-attachments/assets/d4c9cbda-2f69-4762-b1fa-bc6b3ffc2137" />

<img width="1918" height="975" alt="image" src="https://github.com/user-attachments/assets/837119f3-88f7-44ce-ad4d-efaefc0ef2e0" />


<img width="1919" height="958" alt="image" src="https://github.com/user-attachments/assets/aa9d9773-f931-4be3-88f1-0c6665e1440b" />


<img width="1901" height="974" alt="image" src="https://github.com/user-attachments/assets/368e9892-9b5f-4de4-a65f-6482ade64e18" />

<img width="1904" height="971" alt="image" src="https://github.com/user-attachments/assets/155bfaea-8e14-41fc-b104-141874600f01" />

<img width="1919" height="970" alt="image" src="https://github.com/user-attachments/assets/d1709917-6a31-46e5-829a-9da88e3422fd" />

<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/953c4fad-185e-4a25-bcd1-c137551e5b49" />


<img width="1900" height="970" alt="image" src="https://github.com/user-attachments/assets/838e802d-71ff-4094-905e-ea6029df6a9b" />

<img width="1900" height="971" alt="image" src="https://github.com/user-attachments/assets/d7c5804b-b125-4b72-a358-a91ad3062f75" />

<img width="1900" height="969" alt="image" src="https://github.com/user-attachments/assets/f674c541-d375-48c2-be62-0a7f0dfee6f5" />


<img width="1896" height="921" alt="image" src="https://github.com/user-attachments/assets/fa1ccd2d-ae61-48c7-84d1-9e92e81d3029" />




# FOSSEE Workshop Booking Portal 🎓

Hey there! This is my completely redesigned frontend and integrated full-stack build for the **FOSSEE Workshop Booking** platform. 

This platform allows college coordinators to browse available open-source software workshops (like Python, Scilab, OpenFOAM), book instructors, and propose schedules. Previously, it was a traditional, rigid Django-rendered site. I took on the challenge of completely overhauling the UI/UX by converting it into a blazing-fast, mobile-first **React Single Page Application (SPA)**, connected to the Django backend via custom REST APIs.

---

## 🛠️ The Tech Stack
* **Frontend:** React.js, Vite
* **Styling:** Pure Vanilla CSS (`index.css`) utilizing CSS Variables (No heavy libraries like Tailwind or Bootstrap).
* **Backend:** Django (Python), SQLite3
* **Authentication:** Custom React Context API wrapping Django session cookies.

---

## ✨ Features

**For Coordinators:**
* **Browse & Book:** 3D animated workshop catalogue to view all available FOSSEE tools.
* **Propose Workshops:** A new bite-sized, 3-step form to easily propose workshop dates without getting overwhelmed with form fields.
* **My Bookings Dashboard:** Track the status (Pending, Accepted, Rejected) of all past proposals.

**For Instructors:**
* **Inbox Dashboard:** Timeline view of pending workshop requests from colleges.
* **Accept/Reject Control:** Ability to accept or decline workshops based on availability directly from the dashboard.
* **Detailed Statistics:** View personal stats (workshops taken, hours completed).

**Global (Open to All):**
* **Mobile-First Navigation:** App converts to a thumb-friendly bottom-nav app on mobile devices.
* **Public Stats:** Interactive charts showing total workshops taken across the map of India.

---

## 🚀 How to Run locally

### 1. Backend Setup
Make sure you have Python installed. You can set up a virtual environment if you want.
```bash
# Install required packages
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```

### 2. Frontend Setup (Optional for Dev Mode)
The Django server actually serves the *built* production React app automatically so you don't actually need to do this just to view the site. But if you want to make changes to the React code and run the Vite dev server, do this in a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*(Note: You'll still need Django running at the exact same time so the APIs work!)*

---

## 📝 Design & Architecture Reasoning (Required Questions)

**1. What design principles guided your improvements?**  
Honestly, my main goal was to move away from the traditional, rigid dataset look and make it feel more like a modern, engaging app. I focused heavily on a "mobile-first" approach since students and coordinators mostly prefer doing quick checks on their phones. I also prioritized reducing *cognitive load*—instead of showing users a massive wall of text or 20 form fields at once, I broke forms down into bite-sized step-cards so they don’t get overwhelmed. Visually, I stuck to a cohesive, high-contrast hierarchy (Academic Amber and Navy) to make buttons and active states obvious without cluttering the screen.

**2. How did you ensure responsiveness across devices?**  
Instead of just squishing everything down, I completely changed the core navigation flow based on the device. For mobile screens, I hid the top header navigation and replaced it with a fixed bottom navigation bar—this puts all the core tabs right where your thumb naturally rests. To handle different screen sizes organically, I used CSS Flexbox and Grid extensively, and applied `clamp()` functions for fluid typography so text gracefully scales between desktop and mobile rather than awkwardly breaking at rigid breakpoints.

**3. What trade-offs did you make between the design and performance?**  
To keep load times blazing fast on weak mobile data networks, I made a strict decision to drop massive CSS frameworks (like Bootstrap or Tailwind) and avoided heavy UI component libraries (like Material UI). The major trade-off here was my development time—I had to write the entire design system, grid layouts, and animations manually in pure vanilla CSS (`index.css`), which took significantly longer. I also decided to paste SVGs inline inside the React components instead of loading external icon fonts. Making the files slightly longer was a direct trade-off for the massive performance payoff of saving extra network requests.

**4. What was the most challenging part of the task and how did you approach it?**  
The hardest part was definitely converting the long, complex Django-rendered forms (especially the Propose Workshop phase) into the new modern React SPA flow. Building out a multi-step form and handling the validation state gets messy quickly. I approached it by storing a simple `step` integer in the state and conditionally rendering out sections as cards. Once the user fills a card, it unlocks the next one, giving them a sense of momentum! 
Additionally, getting the 3D mouse-tracking tilt effect to work smoothly on the Workshop Catalogue cards took a lot of trial and error with React event listeners and CSS perspective math, but the extremely premium result was totally worth the effort.

---
*Built with ❤️ for FOSSEE.*
