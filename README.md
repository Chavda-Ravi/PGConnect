# PGConnect
MERN STACK Web application

# Getting Started

Follow these steps to run the project on your system.

## 1. Clone the Repository if not already

Clone the project from GitHub:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
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

## 2. Go to Backend

The backend is inside the `backend` folder.

```bash
cd backend
```

---

## 3. Install Dependencies

Install the required backend packages:

```bash
npm install express mongoose dotenv
```

Install Nodemon as a development dependency:

```bash
npm install --save-dev nodemon
```

For authentication, install:

```bash
npm install bcryptjs jsonwebtoken
```

Or, if `package.json` is already present, you can install everything at once using:

```bash
npm install
```

The required backend packages are:

- Express
- Mongoose
- Dotenv
- Nodemon
- bcryptjs
- jsonwebtoken

You do not need to install these packages separately if `package.json` is already present.

---

## 4. Create the `.env` File

The `.env` file contains environment-specific information such as the MongoDB connection string and JWT secret.

The `.env` file is **not included in GitHub** for security reasons.

Inside the `backend` folder, create a new file named:

```text
.env
```

Add:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
```

Replace:

```text
YOUR_MONGODB_CONNECTION_STRING
```

with your MongoDB connection string.

Replace:

```text
YOUR_JWT_SECRET
```

with your JWT secret.

For example:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/PGConnect
JWT_SECRET=your_secret_key
```

### Important

Do **not** push the `.env` file to GitHub.

The `.env` file contains private information such as database credentials and JWT secret.

Every developer working on the project should create their own `.env` file locally.

---

## 5. Start the Backend

Make sure you are inside the `backend` folder:

```bash
cd backend
```

Run the development server:

```bash
npm run dev
```

If everything is configured correctly, you should see something similar to:

```text
Server running on port 5000
MongoDB connected
```

The backend will be available at:

```text
http://localhost:5000
```

# Current Backend Structure

```text
backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── authRoutes.js
│   │
│   ├── scripts/
│   │   └── createAdmin.js
│   │
│   └── server.js
│
├── .env
├── package.json
└── package-lock.json
```

# For Team Members

After pulling the latest code, follow these steps:

```bash
git pull origin main
cd backend
npm install
```

Create your own `.env` file inside the `backend` folder and add:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
```