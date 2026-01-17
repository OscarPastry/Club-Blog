'use client';

import { useState, useEffect } from 'react';
import styles from './Engagement.module.css';

export default function Engagement({ slug }) {
    const [stats, setStats] = useState({ views: 0, likes: 0, comments: [] });
    const [commentText, setCommentText] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial fetch and increment view
    useEffect(() => {
        const initData = async () => {
            // First increment view
            await fetch('/api/engagement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, action: 'view' }),
            });

            // Then fetch latest data
            const res = await fetch(`/api/engagement?slug=${slug}`);
            const data = await res.json();

            if (!data.error) {
                setStats(data);
            }
            setIsLoading(false);
        };

        initData();
    }, [slug]);

    const handleLike = async () => {
        // Logic: Likes cannot exceed Views
        if (stats.likes >= stats.views) return;

        // Optimistic update
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));

        const res = await fetch('/api/engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, action: 'like' }),
        });

        // Sync with true server state
        const updatedData = await res.json();
        setStats(updatedData);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        const newComment = { text: commentText, author: authorName || 'Anonymous' };

        const res = await fetch('/api/engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, action: 'comment', payload: newComment }),
        });

        const updatedStats = await res.json();
        setStats(updatedStats);
        setCommentText('');
        setAuthorName('');
        setIsSubmitting(false);
    };

    if (isLoading) return <div className={styles.loading}>Loading engagement...</div>;

    return (
        <div className={styles.container}>
            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.metric}>
                    <span role="img" aria-label="views">👁️</span> {stats.views} Views
                </div>
                <button onClick={handleLike} className={styles.likeBtn}>
                    <span role="img" aria-label="like">❤️</span> {stats.likes} Likes
                </button>
            </div>

            {/* Comments Section */}
            <div className={styles.commentsSection}>
                <h3>Reader Thoughts ({stats.comments.length})</h3>

                <div className={styles.commentList}>
                    {stats.comments.length === 0 && <p className={styles.empty}>No comments yet. Be the first!</p>}
                    {stats.comments.map((comment, idx) => (
                        <div key={idx} className={styles.comment}>
                            <div className={styles.commentHeader}>
                                <strong>{comment.author}</strong>
                                <span className={styles.date}>{new Date(comment.date).toLocaleDateString()}</span>
                            </div>
                            <p>{comment.text}</p>
                        </div>
                    ))}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <h4>Leave a Note</h4>
                    <input
                        type="text"
                        placeholder="Name (Optional)"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className={styles.input}
                    />
                    <textarea
                        placeholder="Write your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className={styles.textarea}
                        required
                    />
                    <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </div>
    );
}
