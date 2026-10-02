# PGConnect

MERN stack web application that connects students with PG (paying guest) accommodation owners.

Three roles:

- **Student** — search PGs, send inquiries, request bookings, favorite, review.
- **PG Owner** — create PG listings, manage availability, respond to inquiries, accept/reject bookings, view reviews.
- **Admin** — manage users (CRUD).

---

# Live Deployment

| Service  | URL |
| -------- | --- |
| Frontend | https://pgconnect-web.netlify.app |
| Backend  | https://pgconnect-backend.onrender.com |
| Frontend project dashboard | https://app.netlify.com/projects/pgconnect-web |
| Backend project dashboard  | https://dashboard.render.com |

**Hosting stack:**

- **Frontend** → Netlify (free tier)
- **Backend**  → Render (free tier, spins down after 15 min of inactivity)
- **Database** → MongoDB Atlas (free tier)
- **Cache / rate limit** → Upstash Redis (free tier)
- **Image uploads** → Cloudinary (free tier)

---

# Tech Stack

**Backend**

- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- nodemon (dev)
- Upstash Redis (caching + rate limiting)
- Cloudinary (image hosting)

**Frontend**

- React
- Vite
- React Router
- Axios

---

# Getting Started (Local Development)

Follow these steps to run the project on your system.

## 1. Clone the Repository

```bash
git clone https://github.com/Chavda-Ravi/PGConnect.git
```

Go inside the project:

```bash
cd PGConnect
```

If you already have the project, get the latest changes:

```bash
git pull origin main
```

---

## 2. Backend Setup

The backend lives inside the `backend` folder.

```bash
cd backend
```

### 2.1 Install Dependencies

If `package.json` is already present:

```bash
npm install
```

Otherwise, install manually:

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

Required backend packages:

- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- nodemon (dev)

### 2.2 Create the `.env` File

The `.env` file is **not** pushed to GitHub (it contains secrets).

Inside `backend/`, create a file named `.env`:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
UPSTASH_REDIS_REST_URL=YOUR_UPSTASH_URL
UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
FRONTEND_URL=http://localhost:5173
```

Example:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/PGConnect
JWT_SECRET=your_secret_key
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAxxxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=ainebook
CLOUDINARY_API_KEY=979283251641996
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

**Important**

- Do **not** commit `.env` to GitHub.
- Each developer should create their own local `.env`.

### 2.3 Start the Backend

Make sure you are inside `backend/`:

```bash
cd backend
npm run dev
```

Expected output:

```text
Server running on port 5000
MongoDB connected
Upstash Redis client initialized
Cloudinary client initialized
```

Backend URL:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open a **new terminal** (keep backend running).

```bash
cd frontend
```

### 3.1 Install Dependencies

```bash
npm install
```

Required frontend packages (already in `package.json`):

- react
- react-dom
- react-router-dom
- axios
- vite

### 3.2 Start the Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 3.3 API Proxy (Dev Only)

In development, Vite proxies `/api/*` requests to the backend on port 5000. This means the frontend can call `axios.get("/api/...")` and it will hit `http://localhost:5000/api/...` automatically.

The API base URL is defined in `frontend/src/services/api.js`:

```js
const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
});
```

**In production, this changes to the full Render URL.** See the "Deployment" section below.

---

# Current Backend Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── pgOwnerController.js
│   │   ├── PGListingController.js
│   │   ├── availabilityController.js
│   │   ├── inquiryController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   ├── favoriteController.js
│   │   ├── discoveryController.js
│   │   └── uploadController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── rateLimit.js
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── PGOwner.js
│   │   ├── PGListing.js
│   │   ├── Availability.js
│   │   ├── Inquiry.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Favorite.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── pgOwnerRoutes.js
│   │   ├── PGListingRoutes.js
│   │   ├── pgDiscoveryRoutes.js
│   │   ├── availabilityRoutes.js
│   │   ├── inquiryRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── favoriteRoutes.js
│   │   └── uploadRoutes.js
│   │
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   └── seedPGs.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── package-lock.json
```

---

# Current Frontend Structure

```text
frontend/
└── src/
    ├── components/
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   └── PGForm.jsx
    │
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   │
    │   ├── student/
    │   │   ├── StudentDashboard.jsx
    │   │   ├── StudentProfile.jsx
    │   │   ├── PGSearch.jsx
    │   │   ├── PGDetails.jsx
    │   │   ├── Favorites.jsx
    │   │   ├── MyBookings.jsx
    │   │   ├── MyInquiries.jsx
    │   │   └── MyReviews.jsx
    │   │
    │   └── owner/
    │       ├── OwnerDashboard.jsx
    │       ├── OwnerProfile.jsx
    │       ├── MyPGs.jsx
    │       ├── PGDetails.jsx
    │       ├── AddPG.jsx
    │       ├── EditPG.jsx
    │       ├── Availability.jsx
    │       ├── BookingRequests.jsx
    │       ├── Inquiries.jsx
    │       └── Reviews.jsx
    │
    ├── services/
    │   ├── api.js
    │   ├── authService.js
    │   ├── pgService.js
    │   ├── pgOwnerService.js
    │   ├── studentService.js
    │   ├── availabilityService.js
    │   ├── inquiryService.js
    │   ├── bookingService.js
    │   ├── reviewService.js
    │   ├── favoriteService.js
    │   └── uploadService.js
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

---

# Architecture Notes

## Roles

- `student`
- `pg_owner`
- `admin`

## Entity Relationships

```text
User
├── Student           (Student.userId → User._id)
├── PGOwner           (PGOwner.userId → User._id)
│     └── PGListing   (PGListing.ownerId → PGOwner._id)
└── Admin

PGListing
├── Availability      (one per PG)
├── Inquiry
├── Booking
├── Review
└── Favorite
```

### Important Ownership Rules

- `PGListing.ownerId` **references `PGOwner._id`**, NOT `User._id`.
- Never compare `pg.ownerId === req.user.userId`. Always resolve first:

```js
const pgOwner = await PGOwner.findOne({ userId: req.user.userId });
if (pg.ownerId.toString() !== pgOwner._id.toString()) {
    // reject
}
```

- `Inquiry.studentId`, `Booking.studentId`, `Review.studentId`, `Favorite.studentId` all reference **`User._id`** (not `Student._id`). This is intentional.

## No Amenities

The project **intentionally does not include an amenities feature**. Do not add amenities fields to models, forms, API bodies, or UI.

## Discovery

Discovery searches the `PGListing` collection. It is not a separate MongoDB collection. Current supported filters:

- `state` (case-insensitive)
- `city` (case-insensitive)
- `state` + `city`

---

# API Endpoints

## Auth — `/api/auth`

| Method | Path        | Description                         |
| ------ | ----------- | ----------------------------------- |
| POST   | `/register` | Register (student or pg_owner only) |
| POST   | `/login`    | Login and receive JWT               |
| GET    | `/me`       | Get authenticated user (session check) |

## Users — `/api/users` (admin)

| Method | Path   | Description    |
| ------ | ------ | -------------- |
| GET    | `/`    | List users     |
| POST   | `/`    | Create user    |
| GET    | `/:id` | Get user by ID |
| PUT    | `/:id` | Update user    |
| DELETE | `/:id` | Delete user    |

## PG Owner Profile — `/api/pgowners`

| Method | Path       | Description              |
| ------ | ---------- | ------------------------ |
| POST   | `/profile` | Create owner profile     |
| GET    | `/profile` | Get own owner profile    |
| PUT    | `/profile` | Update own owner profile |

## PG Listings (owner) — `/api/pgs`

| Method | Path   | Description          |
| ------ | ------ | -------------------- |
| POST   | `/`    | Create PG listing    |
| GET    | `/`    | Get own PG listings  |
| GET    | `/:id` | Get PG by ID         |
| PUT    | `/:id` | Update own PG        |
| DELETE | `/:id` | Delete own PG        |

## Discovery (student / public) — `/api/discovery/pgs`

| Method | Path      | Description                     |
| ------ | --------- | ------------------------------- |
| GET    | `/`       | Get all PGs                     |
| GET    | `/search` | Search by `state` and/or `city` |
| GET    | `/:id`    | Get PG details                  |

## Availability — `/api/availability`

| Method | Path        | Description                 |
| ------ | ----------- | --------------------------- |
| POST   | `/`         | Create availability (owner) |
| GET    | `/pg/:pgId` | Get availability for a PG   |
| PUT    | `/:id`      | Update availability (owner) |
| DELETE | `/:id`      | Delete availability (owner) |

## Inquiries — `/api/inquiries`

| Method | Path           | Description               |
| ------ | -------------- | ------------------------- |
| POST   | `/`            | Student creates inquiry   |
| GET    | `/student`     | Student's own inquiries   |
| GET    | `/owner`       | Inquiries for owner's PGs |
| PUT    | `/:id/respond` | Owner responds            |

## Bookings — `/api/bookings`

| Method | Path          | Description                          |
| ------ | ------------- | ------------------------------------ |
| POST   | `/`           | Student creates booking              |
| GET    | `/student`    | Student's own bookings               |
| GET    | `/owner`      | Bookings for owner's PGs             |
| GET    | `/:id`        | Get booking by ID (owner or student) |
| PUT    | `/:id/accept` | Owner accepts                        |
| PUT    | `/:id/reject` | Owner rejects                        |
| PUT    | `/:id/cancel` | Student cancels (pending only)       |

## Reviews — `/api/reviews`

| Method | Path        | Description                                      |
| ------ | ----------- | ------------------------------------------------ |
| POST   | `/`         | Student creates review (needs accepted booking)  |
| GET    | `/my`       | Student's own reviews                            |
| GET    | `/pg/:pgId` | Reviews for a PG                                 |
| PUT    | `/:id`      | Update own review                                |
| DELETE | `/:id`      | Delete own review                                |

## Favorites — `/api/favorites`

| Method | Path     | Description                |
| ------ | -------- | -------------------------- |
| POST   | `/:pgId` | Add PG to favorites        |
| DELETE | `/:pgId` | Remove PG from favorites   |
| GET    | `/`      | Get own favorites          |
| GET    | `/:pgId` | Check if a PG is favorited |

## Uploads — `/api/uploads`

| Method | Path        | Description                        |
| ------ | ----------- | ---------------------------------- |
| POST   | `/pg-image` | Upload a PG image (owner, form-data field `image`) |

---

# Frontend Routes

| Path                  | Access  | Page                    |
| --------------------- | ------- | ----------------------- |
| `/`                   | Public  | Home                    |
| `/login`              | Public  | Login                   |
| `/register`           | Public  | Register                |
| `/student/dashboard`  | Student | Dashboard               |
| `/student/search`     | Student | PG Search               |
| `/student/pg/:id`     | Student | PG Details              |
| `/student/inquiries`  | Student | My Inquiries            |
| `/student/bookings`   | Student | My Bookings             |
| `/student/favorites`  | Student | Favorites               |
| `/student/reviews`    | Student | My Reviews              |
| `/student/profile`    | Student | Student Profile         |
| `/owner/dashboard`    | Owner   | Dashboard               |
| `/owner/profile`      | Owner   | Owner Profile           |
| `/owner/pgs`          | Owner   | My PGs                  |
| `/owner/pgs/add`      | Owner   | Add PG                  |
| `/owner/pgs/edit/:id` | Owner   | Edit PG                 |
| `/owner/pgs/:id`      | Owner   | PG Details (owner view) |
| `/owner/availability` | Owner   | Availability (`?pgId=`) |
| `/owner/bookings`     | Owner   | Booking Requests        |
| `/owner/inquiries`    | Owner   | Inquiries               |
| `/owner/reviews`      | Owner   | Reviews                 |

Route guards live in `frontend/src/components/ProtectedRoute.jsx`.

---

# Authentication

- Password hashing: **bcryptjs**
- Tokens: **JWT**, expiry 1 day
- JWT payload:

```json
{
  "userId": "…",
  "role": "student"
}
```

- Frontend stores `token` and `user` in `localStorage`.
- `api.js` attaches `Authorization: Bearer <token>` on every request.
- A `401` from the backend clears localStorage and redirects to `/login`.
- On page load, `ProtectedRoute` calls `GET /api/auth/me` to verify the token before rendering protected content.

### Admin Account

Admin registration is intentionally not available from the public `/register` page. Create an admin with:

```bash
cd backend
node src/scripts/createAdmin.js
```

---

# Testing Data Requirements

Discovery is state/city based. To test search meaningfully, seed at least:

- 5 states
- 5 cities per state
- 5 PGs per city

Suggested dataset:

- Gujarat: Ahmedabad, Vadodara, Surat, Rajkot, Gandhinagar
- Maharashtra: Mumbai, Pune, Nagpur, Nashik, Thane
- Rajasthan: Jaipur, Jodhpur, Udaipur, Kota, Ajmer
- Karnataka: Bengaluru, Mysuru, Mangaluru, Hubballi, Belagavi
- Tamil Nadu: Chennai, Coimbatore, Madurai, Salem, Tiruchirappalli

Use real-looking PG names (e.g. "Sunrise Boys PG") instead of `PG1`, `PG2`.

A seed script is available:

```bash
cd backend
node src/scripts/seedPGs.js
```

---

# Deployment

The app is deployed with:

- **Frontend** → Netlify
- **Backend** → Render

## Backend on Render

1. Create a **Web Service** on Render, connect to the GitHub repo.
2. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
3. Add environment variables (from `backend/.env`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` → the Netlify URL (see below)
4. Deploy. Backend URL will look like:
   ```
   https://pgconnect-backend.onrender.com
   ```

**Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds. This is normal.

## Frontend on Netlify

1. **Update the API base URL first.** In `frontend/src/services/api.js`, change:
   ```js
   baseURL: "https://pgconnect-backend.onrender.com/api",
   ```
   (replace with your Render URL)
2. Commit and push.
3. Create a **New Site** on Netlify, connect to the GitHub repo.
4. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add a `netlify.toml` at the repo root for reproducible settings and React Router redirects:

   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

6. Deploy. Frontend URL will look like:
   ```
   https://pgconnect-web.netlify.app
   ```

## CORS — Link Frontend and Backend

After both are deployed, set `FRONTEND_URL` on Render to the Netlify URL:

```
https://pgconnect-web.netlify.app
```

Save. Render redeploys automatically. Without this, the backend blocks requests from Netlify with a CORS error.

## Live URLs

| Service  | URL |
| -------- | --- |
| Frontend | https://pgconnect-web.netlify.app |
| Backend  | https://pgconnect-backend.onrender.com |

---

# For Team Members

After pulling the latest code:

```bash
git pull origin main
cd backend
npm install
```

Create your own `.env` in `backend/`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/pgconnect
PORT=5000
JWT_SECRET=mind your own business.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=http://localhost:5173
```

Then:

```bash
npm run dev          # backend on :5000
cd ../frontend
npm install
npm run dev          # frontend on :5173
```

Both servers must be running at the same time.

---

# Rules for Contributors

1. Preserve the `User → PGOwner → PGListing` ownership chain.
2. **Do not** add amenities anywhere.
3. **Do not** rename existing routes unless necessary.
4. **Do not** fake authentication on the frontend — always call the backend.
5. Keep `studentId` references pointing to `User`, not `Student`.
6. Build the frontend incrementally — one file at a time, test, then continue.
7. Do not commit `.env`.