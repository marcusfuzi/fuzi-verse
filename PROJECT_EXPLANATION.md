# FUZI VERSE — Project Explanation & Notes

Yeh document is project ka simple aur clear explanation hai taaki koi bhi pooche toh aap easily explain kar sakein ki aapne yeh project kaise banaya hai.

---

## 1. Project Ka Idea Kya Hai? (Project Overview)

**FUZI VERSE** ek full-stack music streaming aur sharing web app hai. 
Iska main goal independent artists aur music listeners ko ek aisi jagah dena hai jahan:
- Artists apne songs upload kar sakein (MP3 audio aur custom cover picture ke saath).
- Users bina kisi rukawat ke music stream kar sakein.
- Har user apni profile customize kar sake (apni photo laga sake aur bio likh sake).
- Ek dedicated Admin Panel ho jo inappropriate songs ko delete kar sake aur spam accounts ko block kar sake.
- App phone par bhi bina kisi download issue ke direct install ho sake (PWA).

---

## 2. Maine Kaun-Kaun Si Technologies Use Ki Hain? (Tech Stack)

### Frontend (Client-side)
- **React.js (v19)**: Component-based UI banane ke liye.
- **Vite**: Super-fast build tool aur local development server.
- **Tailwind CSS**: Modern aur sleek dark theme styling ke liye.
- **Lucide React Icons**: Saare clean UI icons (Play, Pause, Heart, User, Search, etc.).
- **HTML5 Audio API**: Continuous background music playback aur waveform visualizer ke liye.

### Backend (Server-side)
- **Node.js**: JavaScript runtime environment.
- **Express.js**: REST API routes aur endpoints create karne ke liye.
- **Multer**: User dwara upload ki gayi MP3 files aur image covers ko server par save karne ke liye.
- **JWT (JSON Web Token)**: User login session aur secure authentication ke liye.
- **Bcrypt.js**: Passwords ko database me encrypted (hashed) format me rakhne ke liye.

### Database (Data Storage)
- **MongoDB**: NoSQL database jisme users, songs, aur playlists ka data JSON documents ki tarah store hota hai.
- **Mongoose**: Node.js me MongoDB ke schemas aur models define karne ke liye.

---

## 3. Project Ka Architecture Kaise Kaam Karta Hai? (Workflow)

```
[ User Phone / Browser ]
           │
           │  (HTTP / REST API Requests)
           ▼
[ Express.js Server (Port 5050) ]
   ├── Auth Middleware (JWT Token Verify karta hai)
   ├── Multer (Audio & Image files save karta hai `uploads/` folder me)
   └── Routes (Tracks, Users, Playlists, Admin)
           │
           ▼
[ MongoDB Database ]
   ├── Users Collection (User details, password hash, role)
   ├── Tracks Collection (Title, artist, audioUrl, coverArtUrl, plays)
   └── Playlists Collection (Name, tracks array)
```

---

## 4. Key Features Jo Maine Implement Kiye Hain:

### A. Music Player & Streaming
- Bottom me persistent player bar rehta hai — chahe aap kisi bhi page par navigate karein, song pause nahi hota.
- Play, Pause, Next, Previous, Volume slider, aur Seekbar (forward/backward click).
- Real-time animated audio visualizer.

### B. Song Upload System
- Artists apna audio file (MP3/WAV) aur album artwork select karke upload kar sakte hain.
- Backend par Multer disk storage use kiya hai jo safe filenames generate karta hai aur `/uploads/audio` aur `/uploads/covers` me save karta hai.

### C. Unified Profile & Avatar Upload
- Pehle listener aur artist alag the, maine dono ko unify karke ek single clean Profile Page banaya.
- User apni gallery ya device se seedha photo upload karke apni profile picture change kar sakta hai.

### D. Secure Admin Moderation
- Platform par quality maintain karne ke liye Admin account banaya gaya hai.
- Admin credentials secret hain (`marcus_fuzi`).
- Admin panel me jakar admin kisi bhi track ko 1 click me delete kar sakta hai aur kisi bhi user ID ko platform se block kar sakta hai.

### E. Mobile App & QR Code (PWA)
- App poori tarah responsive hai.
- Desktop par **"Get ↗"** button dabakar phone camera se QR scan karte hi website phone par khulti hai aur **"Install App"** ka pop-up aa jata hai.
- Phone ke Home Screen par Fuzi Verse ka icon aa jata hai aur yeh native app ki tarah full-screen chalta hai.

---

## 5. Main Files Aur Unka Kaam (Folder Structure Guide)

- **`server/src/index.js`**: Backend ka main entry point, routes connect karta hai aur MongoDB connect karta hai.
- **`server/src/models/`**:
  - `User.js`: User ka schema (username, email, password, avatar, role: user/admin).
  - `Track.js`: Songs ka schema (title, audioUrl, coverArtUrl, duration, artistId).
  - `Playlist.js`: Playlists ka schema.
- **`server/src/routes/`**:
  - `tracks.js`: Song fetch karna, upload karna, play count update karna.
  - `auth.js`: User signup aur login routes.
  - `admin.js`: Track delete karna aur user block/unblock karna.
- **`client/src/App.jsx`**: Frontend ka main hub jo navigation aur saare pages ko render karta hai.
- **`client/src/context/PlayerContext.jsx`**: Global audio player state (current track, isPlaying, volume).
- **`client/src/context/AuthContext.jsx`**: User login state aur token management.

---

## 6. Agar Viva Ya Interview Me Poochein:

**Q: Database me audio kaise store ho raha hai?**  
*Ans:* Large binary audio files ko seedha database me store karna slow hota hai. Isliye maine best industry practice use ki hai — audio aur image files disk storage par save hoti hain (`server/uploads/`) aur MongoDB me sirf unka URL path (string) store hota hai.

**Q: Passwords secure kaise hain?**  
*Ans:* Passwords database me plain text me nahi jate. Hum `bcryptjs` ka use karke password ko hash karte hain taaki database leak hone par bhi password safe rahe.

**Q: Admin role kaise verify hota hai?**  
*Ans:* Har protected admin route par backend middleware check karta hai ki user ke JWT token me `role: 'admin'` hai ya nahi. Agar koi normal user call kare toh server `403 Forbidden` return kar deta hai.
