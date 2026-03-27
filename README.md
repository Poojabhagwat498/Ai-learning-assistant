# 🚀 AI Learning Assistant

An **AI-powered Learning Assistant** built using the **MERN Stack, WebRTC, Socket.IO, and Google Gemini AI** to enhance learning through intelligent content generation, real-time collaboration, and interactive study tools.

🔗 **Live Demo:** https://ai-learning-assistant-frontend-phi.vercel.app/login
💻 **GitHub Repo:** https://github.com/Poojabhagwat498/ai-learning-assistant

---

## 📌 📖 Overview

The AI Learning Assistant is a **full-stack web application** designed to act as a **smart study companion**. It helps users organize learning materials, generate AI-powered study content, collaborate in real-time, and interact with an AI chatbot for instant doubt resolution.

---

## ✨ 🚀 Features

### 🔐 Authentication & User Management

* Secure login & signup
* User profile management

### 📊 Dashboard

* Personalized learning overview
* Track documents, quizzes, and flashcards

### 🤖 Chat with AI (Gemini AI)

* Real-time AI chat for doubt solving
* Context-aware responses
* Acts like a personal tutor

### 📄 AI Document Processing

* Upload study materials
* Generate summaries using **Gemini AI**
* Extract key concepts

### 🧠 Flashcards Generator

* AI-generated flashcards
* Easy revision and memory retention

### 📝 Quiz Generator

* Auto-generate quizzes from content
* Self-assessment tools

### 👥 Group Study

* Create/join study rooms
* Real-time collaboration

### 🎥 Video Calling

* Peer-to-peer video communication using **WebRTC**

### ⚡ Real-Time Communication

* Messaging using **Socket.IO**
* Live updates and synchronization

### 📌 Task & Request Management

* Manage study tasks
* Send collaboration requests

---

## 🛠️ ⚙️ Tech Stack

### **Frontend**

* React.js
* Tailwind CSS

### **Backend**

* Node.js
* Express.js

### **Database**

* MongoDB

### **AI Integration**

* Google Gemini AI API (chat, summarization, flashcards, quizzes)

### **Real-Time Technologies**

* Socket.IO
* WebRTC

### **Deployment**

* Vercel (Frontend)
* Render (Backend)

---

## 📁 📂 Project Structure

```
AI-Learning-Assistant/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```

---

## ⚙️ 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Poojabhagwat498/ai-learning-assistant.git
cd ai-learning-assistant
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 🔌 API Endpoints (Sample)

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/login    | User login         |
| POST   | /api/auth/register | User registration  |
| GET    | /api/dashboard     | Get dashboard data |
| POST   | /api/documents     | Upload documents   |
| POST   | /api/ai/chat       | AI chat            |
| POST   | /api/quiz          | Generate quiz      |

---

## 🎯 📚 Key Learnings

* Built real-time applications using **Socket.IO**
* Implemented **WebRTC video calling**
* Integrated **Gemini AI** for intelligent features
* Designed scalable backend APIs
* Improved UI/UX with responsive design

---

## 🚀 🔮 Future Improvements

* AI-based personalized learning recommendations
* Voice assistant (speech-to-text)
* Advanced analytics dashboard
* Mobile app version

---

## 🤝 💬 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📧 📬 Contact

👩‍💻 **Pooja Bhagwat**

* GitHub: https://github.com/Poojabhagwat498
* LinkedIn: LinkedIn:https://www.linkedin.com/in/pooja-bhagwat-33447a334

---

## ⭐ Support

If you like this project, please ⭐ the repository and share it!

---
