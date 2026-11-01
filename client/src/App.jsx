import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { PlayerProvider, usePlayer } from './context/PlayerContext.jsx';
import { api } from './services/api.js';

import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import Footer from './components/layout/Footer.jsx';
import MiniPlayer from './components/player/MiniPlayer.jsx';
import NowPlayingModal from './components/player/NowPlayingModal.jsx';

import AuthModal from './components/modals/AuthModal.jsx';
import AddToPlaylistModal from './components/modals/AddToPlaylistModal.jsx';
import ShareModal from './components/modals/ShareModal.jsx';
import ReportTrackModal from './components/modals/ReportTrackModal.jsx';

import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ArtistProfilePage from './pages/ArtistProfilePage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage.jsx';
import CreatorDashboardPage from './pages/CreatorDashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import BeatToolsPage from './pages/BeatToolsPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import DownloadAppModal from './components/modals/DownloadAppModal.jsx';
import MobileInstallBanner from './components/layout/MobileInstallBanner.jsx';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentTrack } = usePlayer();
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParam, setRouteParam] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [shareItem, setShareItem] = useState(null);
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null);
  const [reportTrack, setReportTrack] = useState(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Global datasets for snappy navigation
  const [tracks, setTracks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [historyTracks, setHistoryTracks] = useState([]);

  // Load initial catalog data
  useEffect(() => {
    api.getTracks({ limit: 20 })
      .then((res) => setTracks(res.tracks || []))
      .catch((e) => console.warn(e));

    api.getFeaturedCreators()
      .then((res) => setCreators(res.creators || []))
      .catch((e) => console.warn(e));

    api.getPlaylists()
      .then((res) => setPlaylists(res.playlists || []))
      .catch((e) => console.warn(e));
  }, []);

  // If user logs in, load history
  useEffect(() => {
    if (isAuthenticated) {
      api.getHistory()
        .then((res) => setHistoryTracks(res.tracks || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const navigate = (route, param = null) => {
    setCurrentRoute(route);
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    navigate('explore');
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col relative selection:bg-purple-600 selection:text-white">
      {/* Mobile PWA Install Floating Banner */}
      <MobileInstallBanner />

      {/* Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onSearch={handleGlobalSearch}
        onOpenDownload={() => setDownloadModalOpen(true)}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (hidden on Landing page if desired, or visible for navigation) */}
        {currentRoute !== 'landing' && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={navigate}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            onOpenDownload={() => setDownloadModalOpen(true)}
          />
        )}

        {/* Main Routed Content Area */}
        <main className={`flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-6 ${currentTrack ? 'pb-44 sm:pb-36 lg:pb-28' : 'pb-24 lg:pb-12'}`}>
          {currentRoute === 'landing' && (
            <LandingPage
              onNavigate={navigate}
              featuredTracks={tracks}
            />
          )}

          {currentRoute === 'home' && (
            <HomePage
              tracks={tracks}
              creators={creators}
              playlists={playlists}
              historyTracks={historyTracks}
              onNavigate={navigate}
              onOpenShare={(item) => setShareItem(item)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
              onOpenDownload={() => setDownloadModalOpen(true)}
            />
          )}

          {currentRoute === 'explore' && (
            <ExplorePage
              initialSearch={globalSearch}
              onNavigate={navigate}
              onOpenShare={(item) => setShareItem(item)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          )}

          {currentRoute === 'upload' && (
            <UploadPage onNavigate={navigate} />
          )}

          {(currentRoute === 'profile' || currentRoute === 'artist') && (
            <ArtistProfilePage
              artistId={routeParam}
              onNavigate={navigate}
              onOpenShare={(item) => setShareItem(item)}
              onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
            />
          )}

          {currentRoute === 'library' && (
            <LibraryPage
              onNavigate={navigate}
              onOpenCreatePlaylist={() => setAddToPlaylistTrack(tracks[0] || {})}
              onOpenShare={(item) => setShareItem(item)}
            />
          )}

          {currentRoute === 'playlist' && (
            <PlaylistDetailsPage
              playlistId={routeParam}
              onNavigate={navigate}
            />
          )}

          {currentRoute === 'creator-dashboard' && (
            <CreatorDashboardPage onNavigate={navigate} />
          )}

          {currentRoute === 'admin' && (
            <AdminDashboardPage onNavigate={navigate} />
          )}

          {currentRoute === 'create' && (
            <BeatToolsPage onNavigate={navigate} />
          )}

          {(currentRoute === 'terms' || currentRoute === 'privacy' || currentRoute === 'copyright') && (
            <LegalPage initialTab={currentRoute} />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Persistent Bottom Audio Player Bar */}
      <MiniPlayer
        onNavigate={navigate}
        onOpenShare={(item) => setShareItem(item)}
      />

      {/* Mobile Floating Bottom Bar (Matching Reference Mockup!) */}
      <MobileNav
        currentRoute={currentRoute}
        onNavigate={navigate}
      />

      {/* Fullscreen 3D Immersive Player Modal */}
      <NowPlayingModal
        onOpenShare={(item) => setShareItem(item)}
        onOpenAddToPlaylist={(track) => setAddToPlaylistTrack(track)}
      />

      {/* Interactive Global Modals */}
      <AuthModal />

      {addToPlaylistTrack && (
        <AddToPlaylistModal
          track={addToPlaylistTrack}
          onClose={() => setAddToPlaylistTrack(null)}
          onCreatedNew={() => {
            api.getPlaylists().then((res) => setPlaylists(res.playlists || []));
          }}
        />
      )}

      {shareItem && (
        <ShareModal
          item={shareItem}
          onClose={() => setShareItem(null)}
        />
      )}

      {reportTrack && (
        <ReportTrackModal
          track={reportTrack}
          onClose={() => setReportTrack(null)}
        />
      )}

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}
