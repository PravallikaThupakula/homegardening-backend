# 🌱 Home Gardening Assistant - Backend API

A comprehensive Node.js + Express backend API for the Home Gardening Assistant application, backed by MongoDB and using AWS S3 for media storage.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Deployment](#deployment)

## 🎯 Project Overview

This backend API powers a full-featured gardening assistant application that helps users manage their gardens, track plant care, connect with other gardeners, and access comprehensive gardening resources.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload & Storage**: AWS S3 (using multer for parsing)
- **Password Hashing**: bcrypt

## ✨ Features

### Core Features
- ✅ User Authentication (Register/Login)
- ✅ Plant Database Management
- ✅ Garden Tracker (CRUD operations for user plants)
- ✅ Watering Reminders System
- ✅ Pest & Disease Identification
- ✅ Community Forum (Posts, Comments, Likes)
- ✅ Plant Journal (with image uploads)
- ✅ Gardening Challenges & Leaderboard
- ✅ Seasonal Gardening Tips
- ✅ Shopping List Management
- ✅ AI-Based Plant Care Suggestions

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user and get JWT token

#### Garden Management (`/api/garden`)
- `GET /` - Get all user's plants (Protected)
- `POST /` - Add a new plant with image (Protected)
- `PUT /:id` - Update plant details (Protected)
- `PUT /water/:id` - Mark plant as watered (Protected)
- `DELETE /:id` - Delete a plant (Protected)

#### Dashboard (`/api/dashboard`)
- `GET /` - Get dashboard statistics (Protected)

#### Plant Database (`/api/plants`)
- `GET /` - Get all plants from database
- `GET /search?query=...` - Search plants
- `GET /region/:region` - Get plants by region
- `GET /:id` - Get plant by ID

#### Pest & Disease (`/api/pests`)
- `GET /` - Get all pests and diseases
- `GET /search?query=...` - Search pests
- `GET /plant/:plantType` - Get pests by plant type
- `GET /:id` - Get pest details by ID

#### Forum (`/api/forum`)
- `GET /` - Get all forum posts
- `GET /search?query=...` - Search posts
- `GET /:id` - Get post with comments
- `POST /` - Create a new post (Protected)
- `POST /:postId/comments` - Add comment (Protected)
- `POST /:postId/like` - Like/Unlike post (Protected)

#### Journal (`/api/journal`)
- `GET /` - Get all journal entries (Protected)
- `GET /:id` - Get journal entry by ID (Protected)
- `POST /` - Create journal entry with image (Protected)
- `PUT /:id` - Update journal entry (Protected)
- `DELETE /:id` - Delete journal entry (Protected)

#### Challenges (`/api/challenges`)
- `GET /` - Get all challenges
- `GET /leaderboard` - Get leaderboard
- `GET /user` - Get user's challenges (Protected)
- `GET /:id` - Get challenge by ID
- `POST /:challengeId/join` - Join challenge (Protected)
- `PUT /:challengeId/progress` - Update challenge progress (Protected)

#### Seasonal Tips (`/api/seasonal-tips`)
- `GET /?season=...&region=...` - Get seasonal tips
- `GET /:id` - Get tip by ID

#### Shopping List (`/api/shopping-list`)
- `GET /` - Get user's shopping list (Protected)
- `POST /` - Add item to shopping list (Protected)
- `POST /generate` - Generate list from user's plants (Protected)
- `PUT /:id` - Update shopping list item (Protected)
- `DELETE /:id` - Delete shopping list item (Protected)

#### AI Suggestions (`/api/ai`)
- `GET /suggestions` - Get AI-based care suggestions (Protected)
- `GET /plant/:plantId/tips` - Get personalized tips for a plant (Protected)

## 🗄️ Database Schema

This backend uses MongoDB with Mongoose schemas. Documents are stored in collections matching the models located in `models/*.js`. Primary collections include:

- `users` – stores user profiles, credentials, xp, streak, etc.
- `gardenitems` – user plants with watering info, images stored on S3.
- `seasonaltips` – tips by season and region.
- `journals` – plant journal entries with optional S3 image URLs.
- `forumposts`, `forumcomments`, `forumlikes` – community forum data.
- `pests` – pests & diseases catalog.
- `plants` – plant database used for search and filtering.
- `challenges` and `userchallenges` – challenge definitions and user progress.

Each model defines appropriate fields and indexes; see the files in `models/` for details.- `challenge_id` (UUID, Foreign Key → challenges.id)
- `status` (Text: "in_progress" | "completed")
- `progress` (Integer, 0-100)
- `created_at` (Timestamp)

#### `seasonal_tips`
- `id` (UUID, Primary Key)
- `title` (Text)
- `content` (Text)
- `season` (Text)
- `regions` (Array)
- `plant_types` (Array)
- `created_at` (Timestamp)

#### `shopping_list`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `item_name` (Text)
- `category` (Text)
- `quantity` (Integer)
- `priority` (Text)
- `completed` (Boolean)
- `created_at` (Timestamp)

### Storage Buckets
- `plant-images` - For plant photos
- `journal-images` - For journal entry photos

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd homegardening-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
S3_BUCKET=<your_s3_bucket_name>
AWS_REGION=<your_aws_region>
AWS_ACCESS_KEY_ID=<your_aws_key_id>
AWS_SECRET_ACCESS_KEY=<your_aws_secret>
```

4. **Run the server**
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 🔐 Environment Variables

Required environment variables:

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `S3_BUCKET` - Name of the AWS S3 bucket used for uploads
- `AWS_REGION` - AWS region of the bucket
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - Credentials for S3 access

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```
Uses nodemon for auto-restart on file changes.

### Production Mode
```bash
node server.js
```

## ☁️ Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables in Render dashboard
6. Deploy!

### Environment Variables in Render
Make sure to add all required environment variables in the Render dashboard:
- `MONGO_URI`
- `JWT_SECRET`
- `S3_BUCKET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `PORT` (optional, Render provides this)

## 📝 API Testing

You can test the API using:
- Postman
- cURL
- Thunder Client (VS Code extension)

### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "location": "California"
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example: Get Plants (Protected)
```bash
curl -X GET http://localhost:5000/api/garden \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 1 day. Users need to login again after expiration.

## 📊 Error Handling

All API endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

Error responses follow this format:
```json
{
  "error": "Error message here"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 👨‍💻 Author

Home Gardening Assistant Team

## 🔗 Links

- Frontend Repository: [Link to Frontend Repo]
- Deployed Backend: [Render Deployment Link]
- API Documentation: [Postman Collection Link]
