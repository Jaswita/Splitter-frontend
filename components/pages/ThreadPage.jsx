'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { postApi } from '@/lib/api';
import '../styles/ThreadPage.css';

// Helper to format timestamp
const formatTimestamp = (isoString) => {
  if (!isoString) return 'unknown';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Recursive Reply Component
const ReplyItem = ({ reply, depth, onReply, replyingToId, setReplyingToId, onSubmitReply, isSubmitting, userData }) => {
  const [replyText, setReplyText] = useState('');

  const isReplying = replyingToId === reply.id;
  const showReplyButton = depth < 3 && userData?.id;

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    await onSubmitReply(reply.id, replyText);
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <div
      className={`reply-card depth-${depth}`}
      style={{
        marginLeft: depth > 0 ? '20px' : '0',
        borderLeft: depth > 0 ? '2px solid rgba(255, 255, 255, 0.1)' : 'none',
        paddingLeft: depth > 0 ? '12px' : '0'
      }}
    >
      <div className="reply-author-section">
        <div className="reply-avatar">{reply.avatar_url || '👤'}</div>
        <div className="reply-author-info">
          <div className="reply-author-name">
            {reply.username ? `@${reply.username}` : 'Unknown'}
          </div>
          <div className="reply-timestamp">{formatTimestamp(reply.created_at)}</div>
        </div>
      </div>

      <div className="reply-body">{reply.content}</div>

      <div className="reply-actions">
        {showReplyButton && (
          <button
            className="action-button"
            onClick={() => setReplyingToId(isReplying ? null : reply.id)}
          >
            💬 Reply
          </button>
        )}
      </div>

      {/* Inline Reply Composer */}
      {isReplying && (
        <div className="nested-reply-composer" style={{ marginTop: '10px', marginLeft: '20px' }}>
          <textarea
            className="reply-textarea"
            placeholder={`Replying to @${reply.username || 'user'}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
            style={{ minHeight: '60px', width: '100%', marginBottom: '8px' }}
          />
          <div className="composer-actions">
            <button
              className="reply-button cancel"
              onClick={() => setReplyingToId(null)}
              style={{ marginRight: '8px', background: 'transparent', border: '1px solid currentColor' }}
            >
              Cancel
            </button>
            <button
              className="reply-button"
              onClick={handleSubmit}
              disabled={!replyText.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Render children replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="reply-children">
          {reply.children.map(child => (
            <ReplyItem
              key={child.id}
              reply={child}
              depth={depth + 1}
              onReply={onReply}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
              userData={userData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ThreadPage({ onNavigate, postId, userData }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [post, setPost] = useState(null);
  const [repliesTree, setRepliesTree] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Top-level reply composer state
  const [mainReplyText, setMainReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to track which comment is being replied to (for inline composers)
  const [replyingToId, setReplyingToId] = useState(null);

  useEffect(() => {
    if (postId) {
      loadThreadData();
    }
  }, [postId]);

  const loadThreadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Post Details
      const postData = await postApi.getPost(postId);
      setPost(postData);

      // 2. Fetch Replies
      const repliesData = await postApi.getReplies(postId);

      // 3. Build Tree
      const tree = buildReplyTree(repliesData);
      setRepliesTree(tree);

    } catch (err) {
      console.error('Failed to load thread:', err);
      setError('Failed to load thread. ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to build tree from flat list
  const buildReplyTree = (flatReplies) => {
    if (!flatReplies) return [];

    // Sort by backend rules (should already be sorted, but ensure stable sort if needed, 
    // relying on backend instructions to NOT re-sort, so we trust array order but map parent-child)
    // Actually, to build a tree we need to know children. 
    // Backend returns flat list. We need to nest them.
    // The prompt says "Already sorted". 
    // We must preserving the relative order of siblings.

    const replyMap = {};
    const roots = [];

    // Initialize map
    flatReplies.forEach(reply => {
      replyMap[reply.id] = { ...reply, children: [] };
    });

    // Nest items
    flatReplies.forEach(reply => {
      if (reply.parent_id && replyMap[reply.parent_id]) {
        replyMap[reply.parent_id].children.push(replyMap[reply.id]);
      } else {
        roots.push(replyMap[reply.id]);
      }
    });

    return roots;
  };

  const handlePostReply = async (parentId, content) => {
    setIsSubmitting(true);
    try {
      await postApi.createReply(postId, content, parentId);

      // Refresh replies
      const repliesData = await postApi.getReplies(postId);
      const tree = buildReplyTree(repliesData);
      setRepliesTree(tree);

      // Update post reply count if needed (optional)
      if (post) {
        setPost(prev => ({ ...prev, total_reply_count: (prev.total_reply_count || 0) + 1 }));
      }

    } catch (err) {
      alert('Failed to post reply: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMainReplySubmit = async () => {
    if (!mainReplyText.trim()) return;
    await handlePostReply(null, mainReplyText);
    setMainReplyText('');
  };

  if (!postId) {
    return <div className="thread-container"><div className="thread-content">No post selected.</div></div>;
  }

  if (isLoading && !post) {
    return <div className="thread-container"><div className="thread-content" style={{ textAlign: 'center', marginTop: '50px' }}>Loading thread...</div></div>;
  }

  return (
    <div className="thread-container">
      {/* Top Navigation */}
      <div className="thread-navbar">
        <button
          className="nav-button back-button"
          onClick={() => onNavigate('home')}
        >
          ← Back to Timeline
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('profile')} style={{ padding: '8px 12px', background: 'rgba(0,217,255,0.1)', border: '1px solid #00d9ff', color: '#00d9ff', borderRadius: '6px', cursor: 'pointer' }}>Profile</button>
          <button onClick={toggleTheme} style={{ padding: '8px 12px', background: 'rgba(0,217,255,0.1)', border: '1px solid #00d9ff', color: '#00d9ff', borderRadius: '6px', cursor: 'pointer' }}>{isDarkMode ? '🌙' : '☀️'}</button>
        </div>
      </div>

      <div className="thread-content">

        {error && <div className="error-message" style={{ color: '#ff4444', marginBottom: '20px' }}>{error}</div>}

        {/* Root Post */}
        {post && (
          <div className="root-post-card">
            <div className="post-author-section">
              <div className="post-avatar">{post.avatar_url || '👤'}</div>
              <div className="post-author-info">
                <div className="post-author-name">{post.username ? `@${post.username}` : 'Unknown'}</div>
                <div className="post-timestamp">{formatTimestamp(post.created_at)}</div>
              </div>
              {post.is_local && <span className="local-badge">Local</span>}
            </div>

            <div className="post-body">
              <p>{post.content}</p>
              {post.media && post.media.length > 0 && post.media[0].media_url && (
                <div style={{ marginTop: '10px' }}>
                  <img src={`http://localhost:8000${post.media[0].media_url}`} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            <div className="post-stats">
              <span>{post.like_count || 0} Likes</span>
              <span>{post.repost_count || 0} Boosts</span>
              <span>{post.total_reply_count || 0} Replies</span>
            </div>
          </div>
        )}

        {/* Replies Section */}
        <div className="replies-section">
          {(!repliesTree || repliesTree.length === 0) ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No replies yet. Be the first to reply!</div>
          ) : (
            repliesTree.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                depth={1}
                replyingToId={replyingToId}
                setReplyingToId={setReplyingToId}
                onSubmitReply={handlePostReply}
                isSubmitting={isSubmitting}
                userData={userData}
              />
            ))
          )}
        </div>

        {/* Main Reply Composer (Level 0) */}
        <div className="reply-composer" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          {userData?.id ? (
            <>
              <textarea
                className="reply-textarea"
                placeholder="Write a reply to the post..."
                value={mainReplyText}
                onChange={(e) => setMainReplyText(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
              <div className="composer-actions">
                <span className="char-count">
                  {mainReplyText.length} / 500 characters
                </span>
                <button
                  className="reply-button"
                  onClick={handleMainReplySubmit}
                  disabled={!mainReplyText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <button
                onClick={() => onNavigate('login')}
                style={{ background: 'none', border: 'none', color: '#00d9ff', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
              >
                Log in
              </button> to reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
