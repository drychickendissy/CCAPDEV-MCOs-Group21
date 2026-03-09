# Animo Commons Backend (Phase 2)

Initial Node.js + MongoDB backend scaffold based on your frontend data model and Phase 2 requirements.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   copy .env.example .env
   ```

3. Run the API:

   ```bash
   npm run dev
   ```

4. (Optional) Seed sample data:

   ```bash
   npm run seed
   ```

## Base URL

- `http://localhost:3000`
- Home page (redirect target): `GET /home`
- Template-engine index page: `GET /index`
- Health check: `GET /api/health`

## Main Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users/me` (auth)
- `PATCH /api/users/me` (auth)
- `GET /api/users/:userId`

### Posts

- `GET /api/posts?sortBy=recent|hot|top|trending&category=&authorId=&q=&page=&limit=`
- `GET /api/posts/:postId?incrementView=true`
- `POST /api/posts` (auth)
- `PATCH /api/posts/:postId` (auth, owner)
- `DELETE /api/posts/:postId` (auth, owner)
- `POST /api/posts/:postId/vote` (auth)

### Comments

- `POST /api/posts/:postId/comments` (auth)
- `PATCH /api/posts/:postId/comments/:commentId` (auth, owner)
- `DELETE /api/posts/:postId/comments/:commentId` (auth, owner)
- `POST /api/posts/:postId/comments/:commentId/vote` (auth)

## Auth Header

Use JWT token in:

`Authorization: Bearer <token>`

## Notes for Phase 2

- The backend now uses Handlebars (`.hbs`) as a template engine.
- Project structure now follows class-style hierarchy:
   - `src/views/` for page views
   - `src/views/layouts/` for main layout templates
   - `src/views/partials/` for reusable snippets
   - `public/` for static CSS/JS/assets
- Root route (`/`) redirects to `/home`.
- Legacy paths `/home.html`, `/popular.html`, and `/discover.html` redirect to their clean URL versions.
