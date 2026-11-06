🎧 FUZI VERSE

Your Music. Your Voice. Your Universe.

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=28&pause=1000&color=B66BFF&center=true&vCenter=true&width=750&lines=Welcome+to+FUZI+VERSE!;Discover+Independent+Artists.;Upload+Your+Own+Music.;Share+Your+Sound+With+The+World." />
</p><p align="center">
  <img src="https://img.shields.io/badge/FUZI-VERSE-9B5DE5?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge" />
</p><p align="center">
  **🎵 Not Just a Music Platform — A Universe for Independent Creators.**
</p>---

🌌 About FUZI VERSE

FUZI VERSE is a modern music streaming and creator-sharing platform designed to empower independent musicians, singers, rappers, producers, and emerging artists.

Unlike traditional music platforms that primarily focus on established music catalogs, FUZI VERSE focuses on user-generated music and independent creativity.

Users can create accounts, upload original tracks, discover emerging artists, stream music, create playlists, and connect with a growing music community.

Our Mission: To give every creator a platform where their music, creativity, and voice can be discovered.

✨ Key Features

🎧 Music Streaming

- Stream independently uploaded music.
- Smooth audio playback experience.
- HTTP 206 Partial Content byte-range streaming.
- Instant seeking within audio tracks.
- Play, pause, skip, and volume controls.
- Personalized playlists and favourites.
- Trending and recently uploaded tracks.

🎤 Creator Studio

- Dedicated creator profiles.
- Upload original audio tracks.
- Add titles, descriptions, genres, and cover artwork.
- Manage and edit uploaded tracks.
- Delete personal uploads.
- Track performance and engagement.

👤 User Accounts

- Secure registration and login.
- JWT-based authentication.
- Personalized user profiles.
- Follow favourite artists.
- Like and save tracks.
- Create and manage playlists.
- Recently played music.

🌐 Music Community

- Discover independent artists.
- Explore trending creators.
- Like and comment on tracks.
- Share music with friends.
- Discover music by genre and category.

🛡️ Content Moderation

- Track reporting and moderation.
- Admin review system.
- Five-day moderation grace period.
- Automated content cleanup through "autoPurgeService.js".
- Controlled deletion and media management.

---

🚀 Getting Started

Follow these instructions to run FUZI VERSE locally.

Prerequisites

Install the following before starting:

Requirement| Purpose
Node.js 18+| JavaScript runtime
npm| Package management
MongoDB Atlas| Cloud database
Git| Version control
VS Code| Recommended editor

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/fuzi-verse.git
cd fuzi-verse

2. Install Dependencies

Install the project dependencies in the root, client, and server directories according to their respective package configurations.

npm install

cd client
npm install

cd ../server
npm install

3. Configure Environment Variables

Create a ".env" file inside the server directory.

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_secret_key

NODE_ENV=development

Add any additional environment variables required by your media storage, authentication, or application configuration.

Important: Never upload your ".env" file, database credentials, or JWT secrets to GitHub.

4. Start FUZI VERSE

Option A: One-Click Startup

From the project root:

node start.js

This starts the application components through the root startup script, provided the script and package configurations are set up.

Option B: Individual Terminals

Terminal 1 — Backend:

cd server
npm run dev

Terminal 2 — Frontend:

cd client
npm run dev

🌍 Live Application

<kbd>LIVE</kbd>

Production Website: https://fuzi-verse.onrender.com

📱 Install FUZI VERSE as a PWA

FUZI VERSE supports Progressive Web App installation for a mobile-app-like experience.

1. Open the live website in Chrome.
2. Open the browser menu.
3. Select Install App or Add to Home Screen.
4. Confirm installation.
5. Launch FUZI VERSE directly from your home screen.

---

🏛️ Project Architecture

FUZI VERSE follows a modern client-server architecture with persistent database and audio storage.

System Architecture

flowchart TD
    A["🎧 User / Mobile Device"] <-->|"HTTPS"| B["React 19 Client"]
    B --> C["PlayerContext"]
    C --> D["Web Audio API"]
    B <-->|"REST API / Audio Requests"| E["Express.js Engine"]
    E --> F["JWT Authentication"]
    E --> G["Multer Upload Engine"]
    E --> H["Moderation Engine"]
    E <-->|"Mongoose Models"| I[("MongoDB Atlas")]
    E <-->|"Audio Upload / Retrieval"| J[("GridFS Bucket")]
    H --> K["autoPurgeService.js"]
    K -->|"Five-Day Grace Period"| J
    D --> L["Three.js Visualizers"]

🎵 Audio Streaming Lifecycle

FUZI VERSE uses HTTP byte-range streaming to support efficient playback and instant seeking.

sequenceDiagram
    participant U as User
    participant R as React Player
    participant E as Express Server
    participant G as GridFS

    U->>R: Play Track
    R->>E: HTTP GET Audio Request
    E->>G: Retrieve Audio Chunks
    G-->>E: Audio Data
    E-->>R: HTTP 200 / 206 Partial Content
    R->>U: Start Audio Playback

    U->>R: Seek to New Position
    R->>E: Range: bytes=start-end
    E->>G: Retrieve Requested Byte Range
    G-->>E: Requested Audio Data
    E-->>R: HTTP 206 Partial Content
    R->>U: Continue Playback

Key Streaming Capabilities:

- Supports HTTP "Range" requests.
- Returns HTTP "206 Partial Content" for valid partial requests.
- Uses "Content-Range" and "Accept-Ranges" headers.
- Retrieves required audio chunks from GridFS.
- Enables seeking without downloading the entire audio file.
- Supports efficient audio delivery for longer tracks.

🛡️ Five-Day Moderation Grace Period

FUZI VERSE includes a moderation and automated cleanup mechanism.

Service: "autoPurgeService.js"

flowchart TD
    A["Track Reported / Flagged"] --> B["Moderation Review"]
    B --> C["Grace Period Begins"]
    C --> D{"Five Days Passed?"}
    D -->|"No"| E["Keep Track Under Review"]
    E --> D
    D -->|"Yes"| F{"Moderation Decision"}
    F -->|"Approved"| G["Retain Track"]
    F -->|"Rejected"| H["Purge Eligible Content"]
    H --> I["Clean Associated GridFS Data"]

The five-day grace period allows moderation decisions to be processed before eligible content is permanently purged.

🎛️ Persistent PlayerContext

FUZI VERSE uses React Context API through "PlayerContext" for centralized music player state management.

Responsibilities:

- Maintain the current track.
- Manage play and pause state.
- Control volume and playback progress.
- Handle next and previous tracks.
- Manage queue and playback state.
- Preserve player state across page navigation.
- Coordinate the audio player and visualizer.

Persistent playback state is maintained across application navigation. Actual restoration after a page reload depends on the configured persistence mechanism.

---

💻 Technology Stack

Frontend

Technology| Purpose
React 19| Component-based UI
Tailwind CSS v4| Modern responsive styling
Vite 8| Frontend build tooling
Three.js| WebGL music visualizers
Lucide Icons| Modern interface icons
Web Audio API| Audio processing and playback
PWA| Mobile installation support

Backend

Technology| Purpose
Node.js (ESM)| Backend runtime
Express.js| REST API development
Multer| File upload handling
JWT| User authentication
Bcrypt.js| Password hashing
Morgan| HTTP request logging

Database & Storage

Technology| Purpose
MongoDB Atlas| Cloud database
Mongoose| Database modeling
GridFS| Chunked audio storage
GridFS Bucket| Persistent audio file management

Storage Advantage: GridFS stores audio files in MongoDB rather than relying on temporary application-container storage. This allows stored media to remain available across container restarts, subject to database durability and backup configuration.

DevOps & Deployment

Technology| Purpose
Render| Application hosting
Render CI/CD| Automated deployment pipeline
PWA| Installable application experience
Cloudflare Tunnel| Secure tunnel for development and testing
Git & GitHub| Version control and collaboration

---

📁 Project Information & Directory Structure

FUZI VERSE is organized into three primary sections: "client/", "server/", and "scripts/".

Project Hierarchy

FUZI-VERSE/
│
├── client/
│   ├── public/
│   │   ├── icons/
│   │   ├── images/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   │   └── PlayerContext.jsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── visualizers/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── autoPurgeService.js
│   │   └── streamingService.js
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── scripts/
│   ├── start.js
│   └── maintenance/
│
├── .gitignore
├── README.md
└── package.json

This hierarchy describes the intended project organization; individual filenames may differ in the implementation.

---

🔌 REST API Endpoints

The following table documents the core API design of FUZI VERSE.

Module| Method| Endpoint| Purpose
Auth| POST| "/api/auth/register"| Register user
Auth| POST| "/api/auth/login"| User login
Auth| GET| "/api/auth/me"| Get current user
Streaming| GET| "/api/stream/:trackId"| Stream audio
Tracks| GET| "/api/tracks"| Get all tracks
Tracks| GET| "/api/tracks/:id"| Get track details
Tracks| POST| "/api/tracks/upload"| Upload a track
Tracks| PUT| "/api/tracks/:id"| Update track
Tracks| DELETE| "/api/tracks/:id"| Delete track
Playlists| GET| "/api/playlists"| Get playlists
Playlists| POST| "/api/playlists"| Create playlist
Playlists| PUT| "/api/playlists/:id"| Update playlist
Playlists| DELETE| "/api/playlists/:id"| Delete playlist
Admin| GET| "/api/admin/reports"| View reported content
Admin| PUT| "/api/admin/tracks/:id/moderate"| Moderate track
Admin| GET| "/api/admin/users"| Manage users

Note: These are representative endpoint conventions for the documented API. Match the paths and methods to the actual Express route implementations before treating this table as a live API reference.

---

🎨 Premium UI / UX Experience

FUZI VERSE is designed with an immersive, modern music-streaming interface.

Visual Design Highlights:

- 🌑 Premium dark-themed interface.
- 💜 Neon purple and violet gradients.
- ✨ Animated glowing elements.
- 🌊 Three.js-powered music visualizers.
- 💎 Glassmorphism-inspired cards.
- 🎵 Interactive music player.
- 🎨 Attractive album artwork layouts.
- ⚡ Smooth transitions and animations.
- 📱 Fully responsive design.
- 🎧 Modern creator and listener dashboards.

Visual Design Direction

Element| Design
Primary Background| Deep Black
Secondary Background| Dark Purple
Accent Color| Electric Violet
Highlight Color| Neon Purple
Typography| Modern Sans Serif
Interface Style| Premium Music Streaming

---

🎼 Music Categories

- 🎤 Hip-Hop & Rap
- 🎸 Indie & Alternative
- 💕 Romantic
- 💔 Sad & Emotional
- 🎹 Electronic & EDM
- 🎧 Lo-Fi & Chill
- 🎼 Instrumental
- 🔥 Experimental Music
- 🎵 Acoustic & Unplugged

---

🔐 Security & Content Management

- JWT-based authentication.
- Bcrypt password hashing.
- Protected API routes.
- Role-based access control.
- Secure file upload validation.
- Audio file type and size restrictions.
- MongoDB-backed media storage.
- Content reporting and moderation.
- Five-day moderation grace period.
- Automated eligible-content cleanup.
- Protection against unauthorized track deletion.

---

🔮 Future Enhancements

- 🤖 AI-powered music recommendations.
- 🎙️ Artist verification badges.
- 📊 Advanced creator analytics.
- 💬 Real-time artist and listener interactions.
- 🎵 Collaborative playlists.
- 📱 Dedicated Android and iOS applications.
- 💸 Artist monetization and revenue sharing.
- 🏆 Creator rankings and music charts.
- 🎨 Custom artist profile themes.
- 🔔 Personalized notifications.
- 🌍 Global independent music discovery.

---

💜 Why FUZI VERSE?

Traditional Music Platforms| FUZI VERSE
Primarily established catalogs| Independent creator-focused
Limited emerging artist discovery| Discover new talent
Listener-focused experience| Listener and creator ecosystem
Established artist exposure| A platform for new voices
Music consumption| Music creation, sharing and discovery

---

🤝 Contributing

We welcome developers, designers, musicians, and creative minds to contribute to FUZI VERSE.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Commit your work.
5. Push your branch.
6. Submit a Pull Request.

---

📌 Project Information

Detail| Information
Project Name| FUZI VERSE
Project Type| Music Streaming & Creator Platform
Application Category| Music & Social Community
Frontend| React 19, Tailwind CSS v4
Build Tool| Vite 8
Backend| Node.js, Express.js
Database| MongoDB Atlas
Audio Storage| MongoDB GridFS
Authentication| JWT & Bcrypt.js
Visualizers| Three.js & Web Audio API
Deployment| Render
Application Support| PWA

---

🌠 Our Philosophy

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=24&pause=1200&color=B66BFF&center=true&vCenter=true&width=700&lines=Every+Artist+Has+A+Story.;Every+Beat+Has+A+Feeling.;Every+Voice+Deserves+To+Be+Heard." />
</p><h2 align="center">🎧 FUZI VERSE</h2>
<h3 align="center">"Create Your Sound. Share Your World."</h3><p align="center">
  💜 Discover Talent • Empower Creators • Celebrate Music
</p><p align="center">
  ⭐ If you love FUZI VERSE, give this repository a star!
</p>