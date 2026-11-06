🎧 FUZI VERSE

Your Music. Your Voice. Your Universe.

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=26&pause=1000&color=B66BFF&center=true&vCenter=true&width=750&lines=Welcome+to+FUZI+VERSE!;Discover+Independent+Artists.;Upload+Your+Own+Music.;Share+Your+Sound+With+The+World." />
</p><p align="center">
  <img src="https://img.shields.io/badge/FUZI-VERSE-9B5DE5?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" />
</p><p align="center">**🎵 A Music Universe Built for Independent Creators.**</p>---

🌌 About FUZI VERSE

FUZI VERSE is a modern music streaming and creator-sharing platform where independent artists can upload original music, discover talent, stream tracks, and connect with music lovers.

Our mission is to give every creator a platform to showcase their talent and share their sound with the world.

✨ Key Features

- 🎧 Music Streaming: Smooth playback, instant seeking, playlists and trending tracks.
- 🎤 Creator Studio: Upload, edit and manage original music.
- 👤 User Accounts: Secure login, profiles, likes and artist following.
- 🌐 Music Community: Discover artists, comment and share tracks.
- 🛡️ Moderation: Content reporting and five-day moderation grace period.
- 🎨 Premium UI: Dark theme, neon-purple gradients and animated visualizers.
- 📱 PWA Support: Installable mobile experience.

---

🚀 Getting Started

Prerequisites

- Node.js 18+
- MongoDB Atlas
- Git
- npm

1. Clone Repository

git clone https://github.com/YOUR_USERNAME/fuzi-verse.git
cd fuzi-verse

2. Install Dependencies

Install dependencies in the root, "client/", and "server/" directories as configured.

npm install
cd client && npm install
cd ../server && npm install

3. Configure Environment

Create "server/.env":

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
NODE_ENV=development

4. Start Application

One-click startup:

node start.js

Or use separate terminals:

cd server
npm run dev

cd client
npm run dev

🌍 Live Application

Website: https://fuzi-verse.onrender.com

Mobile Installation: Open the website in Chrome → Menu → Install App / Add to Home Screen.

---

🏛️ Project Architecture

flowchart TD
    A["🎧 User"] <--> B["React 19 Client"]
    B <--> C["Express.js Engine"]
    C <--> D[("MongoDB Atlas")]
    C <--> E[("GridFS Audio Bucket")]
    B --> F["Persistent PlayerContext"]
    F --> G["Web Audio API"]
    C --> H["autoPurgeService.js"]
    H -->|"5-Day Grace Period"| E

🎵 Audio Streaming

- HTTP "206 Partial Content" byte-range streaming.
- Supports instant audio seeking.
- Retrieves audio chunks through MongoDB GridFS.
- Efficient playback without downloading entire tracks.

🛡️ Moderation Engine

- Five-day moderation grace period.
- Automated cleanup through "autoPurgeService.js".
- Eligible content and associated storage cleanup.

🎛️ PlayerContext

Centralized player state management for current tracks, playback, volume, queue and navigation persistence.

---

💻 Technology Stack

Category| Technologies
Frontend| React 19, Tailwind CSS v4, Vite 8
Visuals| Three.js, Web Audio API, Lucide Icons
Backend| Node.js (ESM), Express.js, Multer
Authentication| JWT, Bcrypt.js, Morgan
Database| MongoDB Atlas, Mongoose
Storage| MongoDB GridFS
DevOps| Render CI/CD, PWA, Cloudflare Tunnel

---

📁 Project Structure

FUZI-VERSE/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── context/
│       │   └── PlayerContext.jsx
│       ├── services/
│       ├── visualizers/
│       └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── autoPurgeService.js
│   └── server.js
│
├── scripts/
├── start.js
└── README.md

---

🔌 REST API Endpoints

Module| Method| Endpoint
Auth| POST| "/api/auth/register"
Auth| POST| "/api/auth/login"
Streaming| GET| "/api/stream/:trackId"
Tracks| GET/POST| "/api/tracks"
Tracks| PUT/DELETE| "/api/tracks/:id"
Playlists| GET/POST| "/api/playlists"
Playlists| PUT/DELETE| "/api/playlists/:id"
Admin| GET| "/api/admin/reports"
Admin| PUT| "/api/admin/tracks/:id/moderate"

API paths should match the actual server routes.

---

🔐 Security & Management

- JWT authentication and Bcrypt password hashing.
- Protected routes and role-based permissions.
- Secure audio upload validation.
- GridFS-based persistent media storage.
- Content reporting and moderation.

🔮 Future Enhancements

- 🤖 AI music recommendations.
- 📊 Creator analytics.
- 💸 Artist monetization.
- 💬 Real-time interactions.
- 🏆 Music charts and rankings.
- 📱 Dedicated mobile applications.

---

📌 Project Information

Detail| Information
Project| FUZI VERSE
Type| Music Streaming & Creator Platform
Frontend| React 19
Backend| Node.js, Express.js
Database| MongoDB Atlas
Audio Storage| GridFS
Deployment| Render
Application| Progressive Web App

🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a Pull Request.

---

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=23&pause=1200&color=B66BFF&center=true&vCenter=true&width=700&lines=Every+Artist+Has+A+Story.;Every+Beat+Has+A+Feeling.;Every+Voice+Deserves+To+Be+Heard." />
</p><h2 align="center">🎧 FUZI VERSE</h2>
<h3 align="center">"Create Your Sound. Share Your World."</h3><p align="center">💜 Discover Talent • Empower Creators • Celebrate Music</p>
<p align="center">⭐ If you love FUZI VERSE, give this repository a star!</p>
