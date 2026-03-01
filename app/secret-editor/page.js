'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function SecretEditor() {
    const router = useRouter();
    const [status, setStatus] = useState('');
    const [posts, setPosts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showPreview, setShowPreview] = useState(true);
    const fileInputRef = useRef(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Check against environment variable
        if (passwordInput === process.env.NEXT_PUBLIC_EDITOR_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        author: 'Editor',
        summary: '',
        content: ''
    });

    // Fetch posts on mount
    useEffect(() => {
        fetch('/api/posts-list')
            .then(res => res.json())
            .then(data => {
                if (data.posts) setPosts(data.posts);
            });
    }, [status]); // Reload list when status changes (save/delete)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.md')) {
            alert('Please upload a .md file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            setFormData(prev => ({ ...prev, content: text }));
            setShowPreview(true);
        };
        reader.readAsText(file);
        // Reset file input so the same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [postComments, setPostComments] = useState([]);

    const handleEdit = (post) => {
        setEditingId(post.id);

        // Fetch post content
        fetch(`/api/post?id=${post.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData({
                        title: data.post.title,
                        date: data.post.date,
                        author: data.post.author,
                        summary: data.post.summary,
                        content: data.post.content
                    });
                    window.scrollTo(0, 0);
                }
            });

        // Fetch post engagement (comments)
        fetch(`/api/engagement?slug=${post.id}`)
            .then(res => res.json())
            .then(data => {
                setPostComments(data.comments || []);
            });
    };

    const handleCommentDelete = async (commentId) => {
        if (!confirm('Permanently delete this comment?')) return;

        try {
            await fetch('/api/engagement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: editingId, action: 'delete-comment', payload: { commentId } })
            });

            // Refresh comments
            setPostComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
            console.error("Failed to delete comment", e);
            alert("Error deleting comment");
        }
    };

    const [confirmingId, setConfirmingId] = useState(null);

    const handleDeleteClick = (id) => {
        if (confirmingId === id) {
            // Second click: actually delete
            handleDelete(id);
        } else {
            // First click: show confirmation state
            setConfirmingId(id);
            // Reset confirmation if not clicked after 3 seconds
            setTimeout(() => setConfirmingId(null), 3000);
        }
    };

    const handleDelete = async (id) => {
        setStatus(`Deleting post ${id}...`);

        try {
            const res = await fetch(`/api/post?id=${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus(`Deleted post ${id}`);
                setPosts(prev => prev.filter(p => p.id !== id));
                if (editingId === id) resetForm();
            } else {
                console.error("Delete failed:", data);
                alert(`Failed to delete: ${data.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error("Delete network error:", e);
            alert("Network error while deleting.");
        }
        setConfirmingId(null);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            date: new Date().toISOString().split('T')[0],
            author: 'Editor',
            summary: '',
            content: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving...');

        const url = editingId ? '/api/post' : '/api/create-post';
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setStatus(editingId ? 'Updated successfully!' : 'Created successfully!');
                if (!editingId) resetForm(); // Clear if new post, keep if editing
            } else {
                setStatus('Error saving.');
            }
        } catch (err) {
            console.error(err);
            setStatus('Error saving.');
        }
    };

    if (!isAuthenticated) {
        return (
            <main style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', textAlign: 'center', border: '4px double var(--foreground)' }}>
                <h1>Restricted Area</h1>
                <p>Please enter the password to access the editor.</p>
                <form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Password"
                        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
                    />
                    <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', cursor: 'pointer' }}>
                        Enter
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

            {/* Editor Column */}
            <section style={{ border: '4px double var(--foreground)', padding: '2rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--foreground)' }}>
                    {editingId ? 'Edit Post' : 'New Post'}
                </h1>
                {editingId && <button onClick={resetForm} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← Back to New Post</button>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Title:</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label>Date:</label>
                            <input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Author:</label>
                            <input
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label>Summary:</label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={3}
                            style={{ width: '100%', padding: '0.5rem', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>Content (Markdown):</label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        border: '1px solid var(--foreground)',
                                        background: 'var(--background)',
                                        color: 'var(--foreground)',
                                        borderRadius: '4px'
                                    }}
                                >
                                    📄 Upload .md
                                </button>
                                <input
                                    type="file"
                                    accept=".md"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(prev => !prev)}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        border: '1px solid var(--foreground)',
                                        background: showPreview ? 'var(--foreground)' : 'var(--background)',
                                        color: showPreview ? 'var(--background)' : 'var(--foreground)',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {showPreview ? '👁 Hide Preview' : '👁 Show Preview'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={20}
                                placeholder="Write your story here or upload a .md file..."
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    resize: 'vertical',
                                    minHeight: '400px'
                                }}
                            />
                            {showPreview && (
                                <div
                                    style={{
                                        border: '1px solid var(--foreground)',
                                        padding: '1rem',
                                        overflowY: 'auto',
                                        minHeight: '400px',
                                        maxHeight: '600px',
                                        fontFamily: 'inherit',
                                        lineHeight: '1.6'
                                    }}
                                >
                                    {formData.content ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                img: ({ node, ...props }) => {
                                                    // Ensure the src is valid otherwise don't render
                                                    return props.src ? <img {...props} style={{ maxWidth: '100%' }} /> : null;
                                                }
                                            }}
                                        >
                                            {formData.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic' }}>Preview will appear here...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '1rem',
                            backgroundColor: 'var(--foreground)',
                            color: 'var(--background)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {editingId ? 'Update Post' : 'Publish Post'}
                    </button>

                    {status && <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--accent)' }}>{status}</p>}
                </form>

                {/* Comment Moderation Section */}
                {editingId && (
                    <div style={{ marginTop: '2rem', borderTop: '2px dashed var(--foreground)', paddingTop: '1rem' }}>
                        <h3>Moderate Comments</h3>
                        {postComments.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: '#666' }}>No comments on this post.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {postComments.map(comment => (
                                    <div key={comment.id} style={{ backgroundColor: '#fff', padding: '0.5rem', border: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{comment.author} <span style={{ fontWeight: 'normal', color: '#888' }}>- {new Date(comment.date).toLocaleDateString()}</span></div>
                                            <div style={{ fontSize: '0.9rem' }}>{comment.text}</div>
                                        </div>
                                        <button
                                            onClick={() => handleCommentDelete(comment.id)}
                                            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* List Column */}
            <aside style={{ borderLeft: '1px solid var(--foreground)', paddingLeft: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', color: 'var(--accent)' }}>
                    All Posts
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                    {posts.map(post => (
                        <li key={post.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #ccc' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: post.title }} />
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{post.date}</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEdit(post)} style={{ cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteClick(post.id)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        color: confirmingId === post.id ? 'white' : 'red',
                                        backgroundColor: confirmingId === post.id ? 'red' : 'transparent',
                                        border: confirmingId === post.id ? 'none' : '1px solid red',
                                        padding: confirmingId === post.id ? '2px 6px' : '2px',
                                        borderRadius: '4px',
                                        marginLeft: '5px'
                                    }}
                                >
                                    {confirmingId === post.id ? 'Confirm?' : 'Delete'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

        </main>
    );
}
