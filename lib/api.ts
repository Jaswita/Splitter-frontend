// API Service Layer for Splitter Frontend
// Supports multiple backend instances for federation testing

// Instance URL mapping — maps server domain names to actual API URLs
const INSTANCE_URLS: Record<string, string> = {
  'splitter-1': 'http://localhost:8000/api/v1',
  'splitter-2': 'http://localhost:8001/api/v1',
  'localhost': 'http://localhost:8000/api/v1',  // backward compatibility
};

// Get the current API base URL from localStorage or default
function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('splitter_api_base');
    if (stored) return stored;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

// Set the API base URL (called when user selects a server)
export function setApiBase(serverDomain: string): void {
  const url = INSTANCE_URLS[serverDomain] || `http://localhost:8000/api/v1`;
  if (typeof window !== 'undefined') {
    localStorage.setItem('splitter_api_base', url);
    localStorage.setItem('splitter_instance', serverDomain);
    console.log(`🌐 API base set to: ${url} (instance: ${serverDomain})`);
  }
}

// Export current instance info
export function getCurrentInstance(): { domain: string; url: string } {
  if (typeof window !== 'undefined') {
    const domain = localStorage.getItem('splitter_instance') || 'splitter-1';
    const url = localStorage.getItem('splitter_api_base') || INSTANCE_URLS['splitter-1'];
    return { domain, url };
  }
  return { domain: 'splitter-1', url: INSTANCE_URLS['splitter-1'] };
}

// Alias used throughout this file in fetch calls
function apiBase(): string {
  return getApiBase();
}


// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body: errorText
    });

    let message = `HTTP ${response.status}`;
    try {
      const error = JSON.parse(errorText);
      if (error?.error) {
        message = error.error;
      } else if (errorText) {
        message = errorText;
      }
    } catch {
      if (errorText) {
        message = errorText;
      }
    }
    throw new Error(message);
  }
  return response.json();
}

// Auth API
export const authApi = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
    bio?: string;
    instance_domain?: string;
    did?: string;
    public_key?: string;
    encryption_public_key?: string;
  }, avatarFile?: File) {
    let response: Response;

    if (avatarFile) {
      const fd = new FormData();
      fd.append('username', (data.username || '').trim());
      fd.append('email', (data.email || '').trim());
      fd.append('password', data.password || '');
      if (data.display_name !== undefined) fd.append('display_name', String(data.display_name));
      if (data.bio !== undefined) fd.append('bio', String(data.bio));
      if (data.instance_domain !== undefined) fd.append('instance_domain', String(data.instance_domain));
      if (data.did !== undefined) fd.append('did', String(data.did));
      if (data.public_key !== undefined) fd.append('public_key', String(data.public_key));
      if (data.encryption_public_key !== undefined) fd.append('encryption_public_key', String(data.encryption_public_key));
      fd.append('avatar', avatarFile);

      response = await fetch(`${apiBase()}/auth/register`, {
        method: 'POST',
        body: fd
      });
    } else {
      response = await fetch(`${apiBase()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    const result = await handleResponse<{ user: any; token: string }>(response);
    if (result.token) {
      localStorage.setItem('jwt_token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
    }
    return result;
  },

  async login(data: { username: string; password: string }) {
    const response = await fetch(`${apiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse<{ user: any; token: string }>(response);
    if (result.token) {
      localStorage.setItem('jwt_token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
    }
    return result;
  },

  async getChallenge(did: string) {
    const response = await fetch(`${apiBase()}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ did })
    });
    return handleResponse<{ challenge: string; expires_at: number }>(response);
  },

  async verifyChallenge(data: { did: string; challenge: string; signature: string }) {
    const response = await fetch(`${apiBase()}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse<{ user: any; token: string }>(response);
    if (result.token) {
      localStorage.setItem('jwt_token', result.token);
    }
    return result;
  },

  isLoggedIn() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('jwt_token');
  },

  getCurrentUserFromStorage() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('private_key');
      localStorage.removeItem('public_key');
      localStorage.removeItem('did');
      localStorage.removeItem('encryption_private_key');
      localStorage.removeItem('encryption_public_key');
    }
  }
};

// User API
export const userApi = {
  async getCurrentUser() {
    const response = await fetch(`${apiBase()}/users/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(response);
  },

  async getUserProfile(id: string) {
    const response = await fetch(`${apiBase()}/users/${id}`);
    return handleResponse<any>(response);
  },

  async getUserByDID(did: string) {
    const response = await fetch(`${apiBase()}/users/did?did=${encodeURIComponent(did)}`);
    return handleResponse<any>(response);
  },

  async updateProfile(data: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    default_visibility?: string;
    message_privacy?: string;
    account_locked?: boolean;
  }) {
    const response = await fetch(`${apiBase()}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<any>(response);
  },

  async uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase()}/users/me/avatar`, {
      method: 'POST',
      headers,
      body: fd
    });
    return handleResponse<any>(response);
  },

  async updateEncryptionKey(encryptionPublicKey: string) {
    const response = await fetch(`${apiBase()}/users/me/encryption-key`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ encryption_public_key: encryptionPublicKey })
    });
    return handleResponse<any>(response);
  },

  async deleteAccount() {
    const response = await fetch(`${apiBase()}/users/me`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Post API
export const postApi = {
  async createPost(content: string, visibility: string = 'public', file?: File) {
    const fd = new FormData();

    // Always send content (even empty string)
    fd.append('content', content || '');

    fd.append('visibility', visibility);

    if (file) {
      fd.append('file', file);
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${apiBase()}/posts`, {
      method: 'POST',
      headers: headers, // IMPORTANT: DO NOT set Content-Type manually
      body: fd
    }).then(r => handleResponse<any>(r));
  },

  async getPost(id: string) {
    const response = await fetch(`${apiBase()}/posts/${id}`);
    return handleResponse<any>(response);
  },

  async getUserPosts(userId: string, limit = 20, offset = 0) {
    const response = await fetch(
      `${apiBase()}/posts/user/${userId}?limit=${limit}&offset=${offset}`
    );
    return handleResponse<any[]>(response);
  },

  async getFeed(limit = 20, offset = 0) {
    const response = await fetch(
      `${apiBase()}/posts/feed?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<any[]>(response);
  },

  async getPublicFeed(limit = 20, offset = 0, localOnly = false) {
    const response = await fetch(
      `${apiBase()}/posts/public?limit=${limit}&offset=${offset}&local_only=${localOnly}`
    );
    return handleResponse<any[]>(response);
  },

  async updatePost(id: string, content: string, imageUrl?: string) {
    const response = await fetch(`${apiBase()}/posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, image_url: imageUrl })
    });
    return handleResponse<any>(response);
  },

  async deletePost(id: string) {
    const response = await fetch(`${apiBase()}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async getReplies(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/replies`);
    return handleResponse<any[]>(response);
  },

  async createReply(postId: string, content: string, parentId?: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/replies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ post_id: postId, content, parent_id: parentId || null })
    });
    return handleResponse<any>(response);
  }
};

// Follow API
export const followApi = {
  async followUser(userId: string) {
    console.log('followApi.followUser called with userId:', userId);
    console.log('API endpoint:', `${apiBase()}/users/${userId}/follow`);
    const headers = getAuthHeaders();
    console.log('Auth headers:', headers);

    const response = await fetch(`${apiBase()}/users/${userId}/follow`, {
      method: 'POST',
      headers: headers
    });

    console.log('Follow response status:', response.status);
    const result = await handleResponse<any>(response);
    console.log('Follow result:', result);
    return result;
  },

  async unfollowUser(userId: string) {
    console.log('followApi.unfollowUser called with userId:', userId);
    const response = await fetch(`${apiBase()}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async getFollowers(userId: string, limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/users/${userId}/followers?limit=${limit}&offset=${offset}`
    );
    return handleResponse<any[]>(response);
  },

  async getFollowing(userId: string, limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/users/${userId}/following?limit=${limit}&offset=${offset}`
    );
    return handleResponse<any[]>(response);
  },

  async getFollowStats(userId: string) {
    const response = await fetch(`${apiBase()}/users/${userId}/stats`);
    return handleResponse<{ followers: number; following: number }>(response);
  }
};

// Interaction API
export const interactionApi = {
  async likePost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async unlikePost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async repostPost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/repost`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async unrepostPost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/repost`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async bookmarkPost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async unbookmarkPost(postId: string) {
    const response = await fetch(`${apiBase()}/posts/${postId}/bookmark`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async getBookmarks() {
    const response = await fetch(`${apiBase()}/users/me/bookmarks`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any[]>(response);
  }
};

// Health check
export const healthApi = {
  async check() {
    const response = await fetch(`${apiBase()}/health`);
    return handleResponse<{ status: string }>(response);
  }
};

// Search API
export const searchApi = {
  async searchUsers(query: string, limit = 20, offset = 0) {
    const response = await fetch(
      `${apiBase()}/users/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<{ users: any[] }>(response);
  }
};

// Message API
export const messageApi = {
  async getThreads() {
    const response = await fetch(`${apiBase()}/messages/threads`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ threads: any[] }>(response);
  },

  async getMessages(threadId: string, limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/messages/threads/${threadId}?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<{ messages: any[], thread: any }>(response);
  },

  async sendMessage(recipientId: string, content: string, ciphertext?: string) {
    const response = await fetch(`${apiBase()}/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipient_id: recipientId, content, ciphertext })
    });
    return handleResponse<{ message: any, thread: any, recipient: any }>(response);
  },

  async deleteMessage(messageId: string) {
    const response = await fetch(`${apiBase()}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async editMessage(messageId: string, content: string, ciphertext?: string) {
    const response = await fetch(`${apiBase()}/messages/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, ciphertext })
    });
    return handleResponse<{ message: string }>(response);
  },

  async startConversation(userId: string) {
    const response = await fetch(`${apiBase()}/messages/conversation/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ thread: any }>(response);
  },

  async markAsRead(threadId: string) {
    const response = await fetch(`${apiBase()}/messages/threads/${threadId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Admin API
export const adminApi = {
  async getAllUsers(limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/admin/users?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<{ users: any[], total: number }>(response);
  },

  async getModerationRequests() {
    const response = await fetch(`${apiBase()}/admin/moderation-requests`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ requests: any[] }>(response);
  },

  async approveModerationRequest(userId: string) {
    const response = await fetch(`${apiBase()}/admin/moderation-requests/${userId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async rejectModerationRequest(userId: string) {
    const response = await fetch(`${apiBase()}/admin/moderation-requests/${userId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async updateUserRole(userId: string, role: string) {
    const response = await fetch(`${apiBase()}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse<{ message: string }>(response);
  },

  async suspendUser(userId: string) {
    const response = await fetch(`${apiBase()}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async unsuspendUser(userId: string) {
    const response = await fetch(`${apiBase()}/admin/users/${userId}/unsuspend`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async getSuspendedUsers(limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/admin/users/suspended?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<{ users: any[] }>(response);
  },

  async requestModeration() {
    const response = await fetch(`${apiBase()}/users/me/request-moderation`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  // Content moderation queue
  async getModerationQueue() {
    try {
      const response = await fetch(`${apiBase()}/admin/moderation-queue`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ items: any[] }>(response);
    } catch (err) {
      console.log('Moderation queue endpoint not yet implemented, returning empty');
      return { items: [] };
    }
  },

  async approveContent(reportId: string) {
    const response = await fetch(`${apiBase()}/admin/moderation-queue/${reportId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async removeContent(reportId: string) {
    const response = await fetch(`${apiBase()}/admin/moderation-queue/${reportId}/remove`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(response);
  },

  async warnUser(userId: string, reason: string) {
    const response = await fetch(`${apiBase()}/admin/users/${userId}/warn`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse<{ message: string }>(response);
  },

  async blockDomain(domain: string) {
    const response = await fetch(`${apiBase()}/admin/domains/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ domain })
    });
    return handleResponse<{ message: string }>(response);
  },

  // Get admin action history (ban/unban log)
  async getAdminActions(limit = 50, offset = 0) {
    const response = await fetch(
      `${apiBase()}/admin/actions?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders() }
    );
    // Fallback to empty array if endpoint not implemented yet
    try {
      return handleResponse<{ actions: any[] }>(response);
    } catch (err) {
      console.log('Admin actions endpoint not yet implemented, returning empty');
      return { actions: [] };
    }
  },

  // Suspend user with reason
  async suspendUserWithReason(userId: string, reason: string) {
    const response = await fetch(`${apiBase()}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Federation API - cross-instance communication
export const federationApi = {
  // Get federated timeline (local + remote posts)
  async getTimeline(limit = 50) {
    const response = await fetch(
      `${apiBase()}/federation/timeline?limit=${limit}`
    );
    return handleResponse<{ posts: any[]; total: number }>(response);
  },

  // Search users across all instances (supports @user@domain format)
  async searchUsers(query: string) {
    const response = await fetch(
      `${apiBase()}/federation/users?q=${encodeURIComponent(query)}`
    );
    return handleResponse<{ users: any[]; total: number }>(response);
  },

  // Get all users from all known federated instances
  async getAllUsers() {
    const response = await fetch(
      `${apiBase()}/federation/all-users`
    );
    return handleResponse<{ users: any[]; total: number }>(response);
  },

  // Follow a remote user (requires auth)
  async followRemoteUser(handle: string) {
    const response = await fetch(`${apiBase()}/federation/follow`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ handle })
    });
    return handleResponse<{ status: string; target: string; message: string }>(response);
  },

  // Get public user list from a specific instance (for federation discovery)
  async getPublicUsers(limit = 100) {
    const response = await fetch(
      `${apiBase()}/federation/public-users?limit=${limit}`
    );
    return handleResponse<{ users: any[]; total: number; domain: string }>(response);
  }
};

// Export all APIs
export const api = {
  auth: authApi,
  user: userApi,
  post: postApi,
  follow: followApi,
  interaction: interactionApi,
  health: healthApi,
  search: searchApi,
  message: messageApi,
  admin: adminApi,
  federation: federationApi
};

export default api;
