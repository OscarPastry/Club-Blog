import { supabase } from './supabase';

// Get data for a specific slug
export async function getPostEngagement(slug) {
    const { data: post, error } = await supabase
        .from('posts')
        .select('views, likes, comments (id, author, text, created_at)')
        .eq('slug', slug)
        .single();

    if (error || !post) {
        // Return default structure if post doesn't exist yet in DB
        return { views: 0, likes: 0, comments: [] };
    }

    return {
        views: post.views,
        likes: post.likes,
        comments: (post.comments || []).map(c => ({
            id: c.id,
            author: c.author,
            text: c.text,
            date: c.created_at
        }))
    };
}

// Increment view count
export async function incrementView(slug) {
    // Upsert post to ensure it exists
    await supabase.from('posts').upsert({ slug, title: 'Unknown', date: '2024-01-01', author: 'System' }, { onConflict: 'slug', ignoreDuplicates: true });

    // RPC would be better for atomic increments, but for now we fetch-update or assume client-side cache isn't critical.
    // Actually, let's just do a simple update via rpc if we had one, or get-update.
    // Simplest way without custom RPC:
    const { data } = await supabase.from('posts').select('views').eq('slug', slug).single();
    const currentresult = data ? data.views : 0;

    const { data: updated } = await supabase
        .from('posts')
        .update({ views: currentresult + 1 })
        .eq('slug', slug)
        .select()
        .single();

    return await getPostEngagement(slug);
}

// Enforced Like (Likes <= Views)
export async function incrementLike(slug) {
    const { data } = await supabase.from('posts').select('views, likes').eq('slug', slug).single();

    if (data && data.likes < data.views) {
        await supabase
            .from('posts')
            .update({ likes: data.likes + 1 })
            .eq('slug', slug);
    }

    return await getPostEngagement(slug);
}

// Add comment
export async function addComment(slug, comment) {
    // Insert into comments table
    await supabase.from('comments').insert({
        post_slug: slug,
        text: comment.text,
        author: comment.author || 'Anonymous'
    });

    return await getPostEngagement(slug);
}

// Delete comment
export async function deleteComment(slug, commentId) {
    await supabase.from('comments').delete().eq('id', commentId);
    return await getPostEngagement(slug);
}
