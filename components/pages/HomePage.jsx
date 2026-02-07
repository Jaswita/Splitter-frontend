'use client';

import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import { postApi, interactionApi, adminApi, searchApi, messageApi } from '@/lib/api';
import { useTheme } from '@/components/ui/theme-provider';

// Sample posts for demo when no backend posts available
const SAMPLE_POSTS = [
  {
    id: 'sample-1',
    author: 'alice@federate.tech',
    avatar: '👩',
    displayName: 'Alice Chen',
    handle: '@alice',
    timestamp: '2h ago',
    content: 'Just deployed a new federated instance! 🚀',
    replies: 12,
    boosts: 45,
    likes: 128,
    local: true,
    visibility: 'public'
  }
];

export default function HomePage({ onNavigate, userData, updateUserData, handleLogout }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [activeTab, setActiveTab] = useState('home');
  const [newPostText, setNewPostText] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState('public');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- FETCH POSTS ---------------- */

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let feedPosts;
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('jwt_token')
        : null;

      if (activeTab === 'home') {
        feedPosts = token
          ? await postApi.getFeed(20, 0)
          : await postApi.getPublicFeed(20, 0, false);
      } else if (activeTab === 'local') {
        feedPosts = await postApi.getPublicFeed(20, 0, true);
      } else {
        feedPosts = await postApi.getPublicFeed(20, 0, false);
      }

      if (feedPosts?.length) {
        setPosts(feedPosts.map(post => ({
          id: post.id,
          authorId: post.author_id,
          avatar: post.avatar_url || '👤',
          displayName: post.username || 'Unknown',
          handle: `@${post.username || 'unknown'}`,
          timestamp: formatTimestamp(post.created_at),
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          content: post.content,
          replies: post.total_reply_count || 0,
          boosts: post.repost_count || 0,
          likes: post.like_count || 0,
          liked: post.liked || false,
          reposted: post.reposted || false,
          local: post.is_local ?? true,
          visibility: post.visibility || 'public',
          imageUrl: post.media?.[0]?.media_url || null
        })));
      } else {
        setPosts(SAMPLE_POSTS);
      }
    } catch (err) {
      console.error(err);
      setPosts(SAMPLE_POSTS);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const formatTimestamp = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 60000;
    if (diff < 1) return 'now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const isOwnPost = (post) =>
    post.authorId === userData?.id;

  /* ---------------- UI ---------------- */

  return (
    <div className="home-container">
      <nav className="home-nav">
        <h1 className="nav-logo">🌐 SPLITTER</h1>
        <div>
          <button onClick={toggleTheme}>
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </nav>

      <main className="home-feed">
        {isLoading && <p>Loading posts...</p>}

        {posts.map(post => (
          <article key={post.id} className="post">
            <div className="post-header">
              <span className="post-avatar">{post.avatar}</span>
              <strong>{post.displayName}</strong>
              <span>{post.handle}</span>
              <span>{post.timestamp}</span>
            </div>

            <div
              className="post-content"
              onClick={() => onNavigate('thread', { postId: post.id })}
            >
              {post.content}
            </div>

            {post.imageUrl && (
              <img
                src={`http://localhost:8000${post.imageUrl}`}
                alt="media"
              />
            )}

            <div className="post-actions">
              {/* ✅ FIXED REPLY BUTTON */}
              <button
                className="post-action"
                onClick={() => onNavigate('thread', { postId: post.id })}
                title="Reply to this post"
              >
                💬 {post.replies}
              </button>

              <button className="post-action">
                🚀 {post.boosts}
              </button>

              <button className="post-action">
                ❤️ {post.likes}
              </button>

              {isOwnPost(post) && (
                <button className="post-action">✏️</button>
              )}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
