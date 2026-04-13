# FOSSEE Workshop Booking Portal

This is my submission for the FOSSEE frontend redesign task. The original site was 
pure Django templates — mostly tables and basic forms. I rebuilt the entire frontend 
as a React SPA and connected it to the Django backend through REST APIs I wrote myself.

---

## Demo

https://github.com/user-attachments/assets/08883676-5d7e-4cc7-8465-ff5031749cae

---

## Stack

- **Frontend:** React + Vite
- **Styling:** Vanilla CSS with CSS variables — no Bootstrap, no Tailwind
- **Backend:** Django, SQLite3
- **Auth:** React Context wrapping Django session cookies

---

## Features

**Coordinators**
- Browse workshops (Python, Scilab, OpenFOAM, etc.) through a 3D animated catalogue
- Propose workshop dates via a 3-step card form instead of one giant form
- Dashboard to track booking statuses — Pending, Accepted, Rejected

**Instructors**
- Timeline inbox for incoming workshop requests
- Accept/reject workshops directly from the dashboard
- Personal stats: workshops taken, hours completed

**Everyone**
- Bottom nav bar on mobile (replaces the header)
- Full client-side routing via React Router, no page reloads

---

## Running locally

### Backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
Django serves the built React app automatically at `http://127.0.0.1:8000/` so you 
don't need to run the dev server just to view the site. Only do this if you want to 
edit React code:

```bash
cd frontend
npm install
npm run dev
```
Keep Django running at the same time or the APIs won't work.

---

## Design questions 

**1. What design principles guided your improvements?**  
The original looked like a spreadsheet. My main goal was to make it feel like an 
actual app. I went mobile-first because most students and coordinators are probably 
checking this between classes on their phones. I also didn't want to dump a 20-field 
form on someone, so I split the Propose Workshop flow into 3 cards — fill one, unlock 
the next. Color-wise I kept it simple: Academic Amber + Navy, high contrast, nothing 
decorative that doesn't do something useful.

**2. How did you ensure responsiveness?**  
On mobile I completely hide the top navbar and replace it with a fixed bottom nav bar 
so your thumb can actually reach it. Layouts are CSS Grid and Flexbox throughout. I 
used `clamp()` for font sizes so text scales fluidly between screen sizes instead of 
snapping awkwardly at breakpoints.

**3. What trade-offs did you make?**  
I skipped Bootstrap/Tailwind and any component library to keep the bundle lean — 
university Wi-Fi and mobile data aren't always great. The downside is I had to write 
every layout, card style, and animation by hand in vanilla CSS, which took a lot 
longer. I also inlined all the SVG icons directly into components instead of loading 
an icon font. Makes the JSX files a bit longer but saves extra network requests.

**4. What was the hardest part?**  
Converting the Django multi-step form into a smooth React flow was honestly the 
trickiest bit. Handling validation state across steps got messy fast. I ended up 
storing just a `step` integer in state and conditionally rendering each card — kept 
it simple and manageable. The other thing that took way more time than expected was 
the 3D tilt effect on the workshop catalogue cards. Getting the CSS perspective math 
to feel smooth with React mouse event listeners needed a lot of trial and error, but 
the end result was worth it.

---

## Before & After

| Page | Before (Django templates) | After (React SPA) |
|---|---|---|
| Login | <img width="400" src="https://github.com/user-attachments/assets/5debee01-ee94-4968-b093-4619f5dcc77b" /> | <img width="400" src="https://github.com/user-attachments/assets/74608f20-4328-4093-a68d-5e9b1687cfac" /> |
| Signup | <img width="400" src="https://github.com/user-attachments/assets/c507d479-142a-4fa5-b535-85af4d2a681e" /> | <img width="400" src="https://github.com/user-attachments/assets/d4c9cbda-2f69-4762-b1fa-bc6b3ffc2137" /> |
| Home Dashboard | <img width="400" src="https://github.com/user-attachments/assets/837119f3-88f7-44ce-ad4d-efaefc0ef2e0" /> | <img width="400" src="https://github.com/user-attachments/assets/aa9d9773-f931-4be3-88f1-0c6665e1440b" /> |
| Workshop Stats | <img width="400" src="https://github.com/user-attachments/assets/368e9892-9b5f-4de4-a65f-6482ade64e18" /> | <img width="400" src="https://github.com/user-attachments/assets/155bfaea-8e14-41fc-b104-141874600f01" /> |
| Workshop Status | <img width="400" src="https://github.com/user-attachments/assets/d1709917-6a31-46e5-829a-9da88e3422fd" /> | <img width="400" src="https://github.com/user-attachments/assets/953c4fad-185e-4a25-bcd1-c137551e5b49" /> |
| Add Workshop | <img width="400" src="https://github.com/user-attachments/assets/838e802d-71ff-4094-905e-ea6029df6a9b" /> | <img width="400" src="https://github.com/user-attachments/assets/d7c5804b-b125-4b72-a358-a91ad3062f75" /> |
| Profile | <img width="400" src="https://github.com/user-attachments/assets/f674c541-d375-48c2-be62-0a7f0dfee6f5" /> | <img width="400" src="https://github.com/user-attachments/assets/fa1ccd2d-ae61-48c7-84d1-9e92e81d3029" /> |

---
*Built for FOSSEE, IIT Bombay.*
