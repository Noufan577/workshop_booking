# FOSSEE Workshop Booking Portal 🎓

Hi! This repository contains my full-stack submission for the FOSSEE Workshop Booking platform redesign.

The original project was built purely with Django templates and was mostly tabular. My goal was to completely modernize the UI/UX. I decoupled the visual layer and built a blazing-fast, mobile-first **React Single Page Application (SPA)**, connected to the existing Django backend via custom REST APIs.

---

## 🎥 Working Demo
Watch the completely redesigned React SPA in action (featuring 3D animations and multi-step forms):

https://github.com/user-attachments/assets/08883676-5d7e-4cc7-8465-ff5031749cae

---

## 🛠️ The Tech Stack
* **Frontend:** React.js (via Vite)
* **Styling:** Pure Vanilla CSS (`index.css`) with CSS Variables. No heavy UI libraries!
* **Backend:** Django (Python), SQLite3
* **Authentication:** Custom React Context API wrapping Django session cookies.

---

## ✨ Key Features Built

**For Coordinators:**
* **Browse & Book:** Added a 3D animated workshop catalogue to view all available FOSSEE tools.
* **Propose Workshops:** Rebuilt the massive Django form into a bite-sized, 3-step React card sequence so it's easier to fill out on mobile.
* **My Bookings Dashboard:** Cleanly tracks the status (Pending, Accepted, Rejected) of all past proposals.

**For Instructors:**
* **Inbox Dashboard:** A timeline view of pending workshop requests from colleges.
* **Accept/Reject Control:** Quickly accept or decline workshops based on availability.
* **Detailed Statistics:** Personal stats (workshops taken, hours completed).

**Global:**
* **Mobile-First Navigation:** On mobile, the app hides the top header and uses a thumb-friendly bottom nav bar.
* **Zero-Reload Routing:** Entire frontend runs instantly through React Router.

---

## 🚀 Setup Instructions (How to run locally)

### 1. Backend Setup
Make sure you have Python installed. The backend still serves the authentication and APIs.
```bash
# Install required Python packages
pip install -r requirements.txt

# Run the database migrations to set up SQLite DB
python manage.py migrate

# Start the Django server
python manage.py runserver
```

### 2. Frontend Setup
Because I integrated them, the Django server actually serves the *built* production React app automatically at `http://127.0.0.1:8000/`. You don't *have* to run the React dev server just to see it. 

However, if you want to edit the React code, open a second terminal for the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Design & Architecture Reasoning

**1. What design principles guided your improvements?**  
My main principle was moving away from the "data table" look toward a modern app experience. I used a strict "mobile-first" approach because students and faculty mostly check portal statuses on their phones. I also focused heavily on reducing *cognitive load*. Instead of showing an overwhelming wall of 20 form fields on the Propose Workshop page, I broke it down into chunked step-cards. Visually, I implemented a cohesive, high-contrast palette (Academic Amber and Navy) so primary actions are obvious without needing cluttered text labels.

**2. How did you ensure responsiveness across devices?**  
Instead of just shrinking everything with media queries, I changed the actual UI layout based on device width. For desktop, it uses a standard top navigation header. But for mobile screens, I completely hid the header and built a fixed *bottom navigation bar*—this puts the core tabs right where the thumb naturally rests. I also used CSS Grid/Flexbox for the layouts and `clamp()` functions in my CSS so the font sizes seamlessly scale up and down rather than jumping abruptly at breakpoints.

**3. What trade-offs did you make between the design and performance?**  
To keep load times blazing fast on university Wi-Fi or weak 4G, I made a strict decision *not* to use massive CSS frameworks (like Bootstrap/Tailwind) or heavy component libraries (like Material UI). The major trade-off was development time—I had to manually write the entire design system, grid blocks, and 3D animations in vanilla CSS (`index.css`), which took much longer. I also embedded all SVG icons directly into the React components instead of pulling a web-font, making the code slightly longer but saving us several network requests.

**4. What was the most challenging part of the task and how did you approach it?**  
The hardest part was definitely migrating the complex Django-rendered multi-step forms (like the Propose Workshop phase) into a smooth React SPA flow. Building out a pure React form and handling validation without breaking the backend requirements got messy. I approached it by storing a simple `step` integer in the React state and conditionally rendering the form sections as a stack of cards. Once you fill one card, it unlocks the next, giving the user a sense of momentum. Getting the 3D mouse-tracking tilt effect to perform smoothly on the Workshop Catalogue cards also took significant math and event-listener trial and error!

---

## 🖼️ UI Comparison (Before & After)

*Below are the screenshots comparing the original Django templates vs. the new React SPA.*

| Section | Before (Legacy Django) | After (Modern React SPA) |
| --- | --- | --- |
| **1. Login Page** | <img width="400" src="https://github.com/user-attachments/assets/5debee01-ee94-4968-b093-4619f5dcc77b" /> | <img width="400" src="https://github.com/user-attachments/assets/74608f20-4328-4093-a68d-5e9b1687cfac" /> |
| **2. Signup Page** | <img width="400" src="https://github.com/user-attachments/assets/c507d479-142a-4fa5-b535-85af4d2a681e" /> | <img width="400" src="https://github.com/user-attachments/assets/d4c9cbda-2f69-4762-b1fa-bc6b3ffc2137" /> |
| **3. Home Dashboard** | <img width="400" src="https://github.com/user-attachments/assets/837119f3-88f7-44ce-ad4d-efaefc0ef2e0" /> | <img width="400" src="https://github.com/user-attachments/assets/aa9d9773-f931-4be3-88f1-0c6665e1440b" /> |
| **4. Workshop Statistics** | <img width="400" src="https://github.com/user-attachments/assets/368e9892-9b5f-4de4-a65f-6482ade64e18" /> | <img width="400" src="https://github.com/user-attachments/assets/155bfaea-8e14-41fc-b104-141874600f01" /> |
| **5. Workshop Status** | <img width="400" src="https://github.com/user-attachments/assets/d1709917-6a31-46e5-829a-9da88e3422fd" /> | <img width="400" src="https://github.com/user-attachments/assets/953c4fad-185e-4a25-bcd1-c137551e5b49" /> |
| **6. Add Workshop Page** | <img width="400" src="https://github.com/user-attachments/assets/838e802d-71ff-4094-905e-ea6029df6a9b" /> | <img width="400" src="https://github.com/user-attachments/assets/d7c5804b-b125-4b72-a358-a91ad3062f75" /> |
| **7. Profile Page** | <img width="400" src="https://github.com/user-attachments/assets/f674c541-d375-48c2-be62-0a7f0dfee6f5" /> | <img width="400" src="https://github.com/user-attachments/assets/fa1ccd2d-ae61-48c7-84d1-9e92e81d3029" /> |

---
*Built for FOSSEE, IIT Bombay.*