# CCAPDEV Machine Project – Phase 1  
**Course:** CCAPDEV Term 1, AY 2023–2024  
**Phase:** Front-End Development  
**Weight:** 20% of final grade  

---

## Project Overview
This repository contains the **front-end implementation** of our selected web application for **Phase 1** of the CCAPDEV machine project.  
The focus of this phase is on **HTML, CSS, and JavaScript-based views**, ensuring that all user-facing features are represented and navigable.  

Back-end logic is **not required** at this stage. Data is **hardcoded** with at least 5 realistic samples per feature (e.g., users, posts, comments).  

---

## Deliverables
- A **zip file** containing all project files.  
- Filename format: CCAPDEV-Phase1-Group<#>.zip
- Submission via **AnimoSpace**.  
- Collaboration through **GitHub repository** (this repo serves as reference for group contributions).  

---

## Specifications
- Develop front-end views using **HTML, CSS, JavaScript**.  
- Optional use of libraries/frameworks: **Bootstrap, React, Meteor**, etc.  
- All views must be accessible and navigable starting from the **index page**.  
- Hardcoded sample data (minimum of 5 entries per feature).  
- No lorem ipsum filler text — use life-like data.  

---

## Group Work Guidelines
- Groups of **up to 4 members**.  
- Equal contribution expected from all members.  
- Internal resolution of group issues; escalate to lecturer if necessary.  

---

## Grading Rubric (Total: 75 pts)
| Criteria              | Excellent | Good | Developing | No Marks | Points |
|-----------------------|-----------|------|------------|----------|--------|
| **Project Goals**     | 20 pts – All views implemented | 10 pts – Some views | 5 pts – Few views | 0 pts – None | 20 |
| **Navigation**        | 15 pts – All views navigable via index | 7 pts – Some views require direct URL | – | 0 pts – File system only | 15 |
| **Visual Design**     | 10 pts – Fully aligned with features | 5 pts – Partially aligned | – | 0 pts – Not aligned | 10 |
| **Graphics**          | 10 pts – Appropriate, clear icons/graphics | 5 pts – Related but poor quality | – | 0 pts – Distracting/none | 10 |
| **Content Organization** | 20 pts – Well-organized, relevant | 10 pts – Minimal effort | – | 0 pts – Not organized | 20 |

---

## Usage
1. Clone the repository:
 ```bash
 git clone https://github.com/your-username/ccapdev-phase1.git
```
2. Open index.html in a browser.
3. Navigate through all implemented views.
4. Review hardcoded sample data for each feature.

--- 

# CCAPDEV Machine Project – Phase 2  
**Course:** CCAPDEV Term 1, AY 2023–2024  
**Phase:** Back-End Development  
**Weight:** 20% of final grade  

---

## Project Overview

This repository contains the Phase 2 submission for Animo Commons using Node.js, Express, MongoDB (Mongoose), and Handlebars.
For this phase, the group is required to develop the back-end logic of the chosen web application.
The README.md file at the root directory of the repository should contain instructions on how to set-up and to run the application locally through a Node.js server.

--- 
## Grading Rubric (Total: 75 pts)

| Criteria | Excellent | Very Good | Good | Developing | No Marks | Points |
|---|---|---|---|---|---|---|
| **Database** | **20 pts** – Implemented database model is 100% complete. | **12 pts** – Implemented database model is partially complete (>75%). | **7 pts** – Implemented database model is partially complete (>50%). | **3 pts** – Implemented database model is sparsely complete (>25%). | **0 pts** – Database is not implemented. | **20** |
| **Views** | **15 pts** – All views needed for all features are complete and navigable from the index page. | – | **7 pts** – Not all views are navigable within the site; some require direct URL access. Views are not in proper folder. | – | **0 pts** – Views are still in HTML; project is not implemented with a template engine. | **15** |
| **Controller** | **20 pts** – Properly routes all incoming requests to the correct response/data. | **15 pts** – Properly routes most incoming requests (1–2 missed routes). | **10 pts** – Properly routes most incoming requests (3–4 missed routes). | **5 pts** – Properly routes most incoming requests (>5 missed routes). | **0 pts** – Does not accomplish the app’s intent. | **20** |
| **Content Organization** | **5 pts** – Information presentation, access, and manipulation are clear and appropriate to the feature. | – | **2 pts** – Presentation is acceptable but could be more appropriate. | – | **0 pts** – Content cannot be accessed or manipulated. | **5** |
| **Navigation** | **5 pts** – App is easy to navigate. | – | **2 pts** – Users are sometimes confused by navigation. | – | **0 pts** – Users cannot navigate without developer help. | **5** |
| **Visual Design** | **5 pts** – View aligns with all features; users can complete tasks easily. | – | **2 pts** – View aligns with some features; task steps may be confusing. | – | **0 pts** – Users cannot complete tasks without developer help. | **5** |
| **Graphics** | **5 pts** – Graphics/icons are appropriate, clear, and supported with text if needed. | – | **2 pts** – Graphics fit app purpose but are low quality. | – | **0 pts** – Graphics are absent or distracting. | **5** |

## Project Structure

- `backend/src/model/` – Mongoose models and database entities
- `backend/src/controllers/` – Route handlers/business logic
- `backend/src/routes/` – API and view routes
- `backend/src/views/` – Handlebars views
- `backend/src/views/layouts/` – Handlebars layouts
- `backend/src/views/partials/` – Reusable template partials
- `backend/public/` – Static CSS/JS/assets

## Requirements

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/animo_commons`)

## Quick Start

If setup is already done, run the backend with:

```bash
npm --prefix backend run dev
```

## First-Time Setup

From the repository root:

1. Install backend dependencies:
   - `npm --prefix backend install`
2. Seed sample data:
   - `npm --prefix backend run seed`
3. Start development server:
   - `npm --prefix backend run dev`

Server runs at:
- `http://localhost:3000`

## Main Routes

- Entry route: `/` (redirects to `/index`)
- App home: `/home`
- Index page: `/index`
- Popular: `/popular`
- Discover: `/discover`
- Profile: `/profile`
- Edit Profile: `/edit-profile`
- Login: `/login`
- Sign Up: `/sign-up`
- API health: `/api/health`

## API Summary

- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Posts + Comments + Votes: `/api/posts/*`

## Routing Notes

- Legacy `.html` paths are still supported and redirected to clean routes:
   - `/home.html` → `/home`
   - `/popular.html` → `/popular`
   - `/discover.html` → `/discover`
   - `/profile.html` → `/profile`
   - `/edit-profile.html` → `/edit-profile`
   - `/login.html` → `/login`
   - `/sign-up.html` → `/sign-up`

## View Layer Notes

- Handlebars layout flags control page-specific CSS/JS includes in `backend/src/views/layouts/main.hbs`.
- Home page runtime logic is loaded from `backend/public/home.js` (extracted from inline script).
- Index page styling is loaded from `backend/public/index.css` (extracted from inline style).
