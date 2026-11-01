const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('fuzi_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('fuzi_token', token);
  } else {
    localStorage.removeItem('fuzi_token');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (formData) => request('/auth/update-profile', { method: 'PUT', body: formData }),
  changePassword: (payload) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Tracks
  getTracks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tracks${qs ? `?${qs}` : ''}`);
  },
  getTrack: (id) => request(`/tracks/${id}`),
  uploadTrack: (formData) => request('/tracks/upload', { method: 'POST', body: formData }),
  updateTrack: (id, payload) =>
    request(`/tracks/${id}`, {
      method: 'PUT',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),
  deleteTrack: (id) => request(`/tracks/${id}`, { method: 'DELETE' }),
  recordPlay: (id) => request(`/tracks/${id}/play`, { method: 'POST' }),
  toggleLike: (id) => request(`/tracks/${id}/like`, { method: 'POST' }),

  // Playlists
  getPlaylists: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/playlists${qs ? `?${qs}` : ''}`);
  },
  getMyPlaylists: () => request('/playlists/my'),
  getPlaylist: (id) => request(`/playlists/${id}`),
  createPlaylist: (payload) => request('/playlists', { method: 'POST', body: JSON.stringify(payload) }),
  addTrackToPlaylist: (playlistId, trackId) =>
    request(`/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify({ trackId }) }),
  removeTrackFromPlaylist: (playlistId, trackId) =>
    request(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),

  // Users & Creators
  getFeaturedCreators: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/creators${query ? `?${query}` : ''}`);
  },
  getUserProfile: (usernameOrId) => request(`/users/${usernameOrId}`),

  // Comments
  getComments: (trackId) => request(`/comments/track/${trackId}`),
  addComment: (trackId, payload) =>
    request(`/comments/track/${trackId}`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),

  // Social
  toggleFollow: (userId) => request(`/social/follow/${userId}`, { method: 'POST' }),
  getNotifications: () => request('/social/notifications'),
  markNotificationsRead: () => request('/social/notifications/read', { method: 'PUT' }),
  getLikedTracks: () => request('/social/library/liked'),
  getMyUploads: () => request('/social/library/uploads'),
  getHistory: () => request('/social/library/history'),
  getFollowingCreators: () => request('/social/library/following'),
  reportTrack: (payload) => request('/social/report', { method: 'POST', body: JSON.stringify(payload) }),

  // Network & Mobile QR
  getNetworkInfo: () => request('/network-info'),

  // Creator Analytics
  getCreatorAnalytics: () => request('/analytics/creator'),

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAdminReports: () => request('/admin/reports'),
  handleAdminReportAction: (reportId, action) =>
    request(`/admin/reports/${reportId}/action`, { method: 'POST', body: JSON.stringify({ action }) }),
  getAdminUsers: () => request('/admin/users'),
  getAdminTracks: (query = '') => request(`/admin/tracks${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  adminDeleteTrack: (trackId) => request(`/admin/tracks/${trackId}`, { method: 'DELETE' }),
  toggleSuspendUser: (userId) => request(`/admin/users/${userId}/toggle-suspend`, { method: 'POST' }),
  blockTrack: (trackId) => request(`/admin/tracks/${trackId}/block`, { method: 'POST' }),
  unblockTrack: (trackId) => request(`/admin/tracks/${trackId}/unblock`, { method: 'POST' }),
  blockUser: (userId) => request(`/admin/users/${userId}/block`, { method: 'POST' }),
  unblockUser: (userId) => request(`/admin/users/${userId}/unblock`, { method: 'POST' }),
};
