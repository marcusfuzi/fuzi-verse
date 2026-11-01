import React, { useState, useEffect, useRef } from 'react';
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
  const { isAuthenticated, authModalOpen, closeAuthModal } = useAuth();
  const { currentTrack, isNowPlayingOpen, closeNowPlaying } = usePlayer();
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

    const refreshCatalog = () => {
    api.getTracks({ limit: 50 })
      .then((res) => setTracks(res.tracks || []))
      .catch((e) => console.warn(e));

    api.getFeaturedCreators({ limit: 20 })
      .then((res) => setCreators(res.creators || []))
      .catch((e) => console.warn(e));

    api.getPlaylists()
      .then((res) => setPlaylists(res.playlists || []))
      .catch((e) => console.warn(e));
  };

  // Load initial catalog data & real-time auto-refresh for new uploads/IDs
  useEffect(() => {
    refreshCatalog();

    // Refresh when user switches back to tab
    const handleFocus = () => refreshCatalog();
    window.addEventListener('focus', handleFocus);

    // Periodic silent refresh every 45s so all users see new songs & creators in real time
    const interval = setInterval(refreshCatalog, 45000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // If user logs in, load history
  useEffect(() => {
    if (isAuthenticated) {
      api.getHistory()
        .then((res) => setHistoryTracks(res.tracks || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Fresh state refs to prevent stale closure in popstate listener
  const currentRouteRef = useRef(currentRoute);
  const routeParamRef = useRef(routeParam);
  const isNowPlayingOpenRef = useRef(isNowPlayingOpen);
  const downloadModalOpenRef = useRef(downloadModalOpen);
  const shareItemRef = useRef(shareItem);
  const addToPlaylistTrackRef = useRef(addToPlaylistTrack);
  const reportTrackRef = useRef(reportTrack);
  const authModalOpenRef = useRef(authModalOpen);

  useEffect(() => { currentRouteRef.current = currentRoute; }, [currentRoute]);
  useEffect(() => { routeParamRef.current = routeParam; }, [routeParam]);
  useEffect(() => { isNowPlayingOpenRef.current = isNowPlayingOpen; }, [isNowPlayingOpen]);
  useEffect(() => { downloadModalOpenRef.current = downloadModalOpen; }, [downloadModalOpen]);
  useEffect(() => { shareItemRef.current = shareItem; }, [shareItem]);
  useEffect(() => { addToPlaylistTrackRef.current = addToPlaylistTrack; }, [addToPlaylistTrack]);
  useEffect(() => { reportTrackRef.current = reportTrack; }, [reportTrack]);
  useEffect(() => { authModalOpenRef.current = authModalOpen; }, [authModalOpen]);

  // Synchronize open modals with history
  const anyModalOpen = Boolean(
    downloadModalOpen ||
    shareItem ||
    addToPlaylistTrack ||
    reportTrack ||
    authModalOpen
  );

  useEffect(() => {
    if (anyModalOpen) {
      if (window.history?.state?.layer !== 'modal') {
        try {
          window.history.pushState({ ...window.history?.state, layer: 'modal' }, '');
        } catch (e) {}
      }
    }
  }, [anyModalOpen]);

  // Initial root state setup
  useEffect(() => {
    if (!window.history?.state || !window.history?.state?.route) {
      window.history.replaceState({ route: 'home', param: null, layer: 'root' }, '');
    } else if (window.history.state.route && window.history.state.route !== currentRoute) {
      setCurrentRoute(window.history.state.route);
      if (window.history.state.param) setRouteParam(window.history.state.param);
    }
  }, []);

  // Handle Android Back button & browser back navigation
  useEffect(() => {
    const handlePopState = (e) => {
      // 1. Modals priority: if any modal is open, close it first
      if (downloadModalOpenRef.current) {
        setDownloadModalOpen(false);
        return;
      }
      if (shareItemRef.current) {
        setShareItem(null);
        return;
      }
      if (addToPlaylistTrackRef.current) {
        setAddToPlaylistTrack(null);
        return;
      }
      if (reportTrackRef.current) {
        setReportTrack(null);
        return;
      }
      if (authModalOpenRef.current) {
        closeAuthModal(true);
        return;
      }

      // 2. Fullscreen Player priority: minimize it down to MiniPlayer!
      if (isNowPlayingOpenRef.current) {
        closeNowPlaying();
        return;
      }

      // 3. Page route navigation
      const state = e.state;
      if (state && state.route) {
        // If user was already on Home and pressed back: allow Android to exit app
        if (state.route === 'home' && currentRouteRef.current === 'home') {
          try {
            window.history.back();
          } catch (err) {}
          return;
        }
        setCurrentRoute(state.route);
        setRouteParam(state.param || null);
      } else {
        // If reached beginning or null state, default to home
        setCurrentRoute('home');
        setRouteParam(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closeAuthModal, closeNowPlaying]);

  const navigate = (route, param = null) => {
    if (route === currentRoute && param === routeParam) return;

    if (route === 'home' || route === 'explore') {
      refreshCatalog();
    }

    if (isNowPlayingOpenRef.current) closeNowPlaying();
    setShareItem(null);
    setAddToPlaylistTrack(null);
    setReportTrack(null);
    setDownloadModalOpen(false);

    if (route === 'home') {
      try {
        window.history.replaceState({ route: 'home', param: null, layer: 'root' }, '');
      } catch (e) {}
      setCurrentRoute('home');
      setRouteParam(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      window.history.pushState({ route, param, layer: 'route' }, '');
    } catch (e) {}

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
      {!isNowPlayingOpen && <MobileInstallBanner />}

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
            <UploadPage
              onNavigate={navigate}
              onTrackUploaded={(newTrack) => {
                setTracks((prev) => [newTrack, ...prev.filter((t) => t._id !== newTrack._id)]);
                refreshCatalog();
              }}
            />
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
      {!isNowPlayingOpen && (
        <MiniPlayer
          onNavigate={navigate}
          onOpenShare={(item) => setShareItem(item)}
        />
      )}

      {/* Mobile Floating Bottom Bar (Matching Reference Mockup!) */}
      {!isNowPlayingOpen && (
        <MobileNav
          currentRoute={currentRoute}
          onNavigate={navigate}
        />
      )}

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
          onClose={() => {
            if (window.history?.state?.layer === 'modal') {
              try { window.history.back(); return; } catch (e) {}
            }
            setAddToPlaylistTrack(null);
          }}
          onCreatedNew={() => {
            api.getPlaylists().then((res) => setPlaylists(res.playlists || []));
          }}
        />
      )}

      {shareItem && (
        <ShareModal
          item={shareItem}
          onClose={() => {
            if (window.history?.state?.layer === 'modal') {
              try { window.history.back(); return; } catch (e) {}
            }
            setShareItem(null);
          }}
        />
      )}

      {reportTrack && (
        <ReportTrackModal
          track={reportTrack}
          onClose={() => {
            if (window.history?.state?.layer === 'modal') {
              try { window.history.back(); return; } catch (e) {}
            }
            setReportTrack(null);
          }}
        />
      )}

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={downloadModalOpen}
        onClose={() => {
          if (window.history?.state?.layer === 'modal') {
            try { window.history.back(); return; } catch (e) {}
          }
          setDownloadModalOpen(false);
        }}
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
