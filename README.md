# 👗 Digital Closet – Full Stack Wardrobe Management App

Digital Closet is a full-stack web application that allows users to organize their wardrobe digitally, upload clothing items with images, generate outfits, and manage their personal closet from one place.

This project started as a static HTML/CSS/JavaScript prototype and was transformed into a connected full-stack application using React, Node.js, Express, PostgreSQL, and Cloudinary.

---

## ✨ Features

### Authentication

* User registration
* User login
* Password hashing with bcrypt
* JWT authentication
* Protected routes

### Clothing Management

* Add clothing items
* Upload clothing images
* Store clothing information in PostgreSQL
* View all items inside personal closet
* Delete and edit clothing items

### Closet System

* Clothing categories:

  * Tops
  * Bottoms
  * Shoes
  * Jackets
  * Accessories

### Outfit Features

* Random outfit generation
* Save outfits
* Build custom outfits manually
* AI Try-On page structure ready

### Cloud Storage

* Upload images directly using Cloudinary
* Store image URLs in database

### Frontend Features

* Responsive UI
* React Router navigation
* Reusable components
* Connected API architecture

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Authentication

* JWT
* bcryptjs

### Media Storage

* Cloudinary

---

## 📁 Project Structure

```bash
digital-closet-project/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── frontend-react/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone repository

```bash
git clone https://github.com/yourusername/digital-closet.git
```

Move into project:

```bash
cd digital-closet-project
```

---

## Backend Setup

Move into backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=your_database_url

JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Frontend Setup

Move into frontend:

```bash
cd frontend-react
```

Install dependencies:

```bash
npm install
```

Run project:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## ☁️ Cloudinary Setup

Create an unsigned upload preset in Cloudinary.

Inside:

```js
src/services/cloudinary.js
```

Add:

```js
const CLOUD_NAME = "your_cloud_name";
const UPLOAD_PRESET = "your_upload_preset";
```

---

## 🔐 Environment Variables

Backend `.env`

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

Do NOT upload:

* .env
* node_modules

Make sure these are inside `.gitignore`

```gitignore
node_modules
.env
dist
```

---

## 🚀 Future Improvements (Project 5)

Planned features:

* AI Virtual Try-On generation
* AI outfit recommendations


---



## 👩‍💻 Author

Created by Mariam

Full Stack Development Internship Project
