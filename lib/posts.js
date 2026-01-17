import { supabase } from './supabase';
import { remark } from 'remark';
import html from 'remark-html';

export async function getSortedPostsData() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('slug, title, date, author, summary')
        .order('date', { ascending: false });

    if (error || !posts) return [];

    return posts.map(post => ({
        id: post.slug, // Use slug as id for compatibility
        ...post
    }));
}

export async function getAllPostIds() {
    const { data: posts } = await supabase.from('posts').select('slug');
    return (posts || []).map(post => ({
        params: {
            slug: post.slug
        }
    }));
}

export async function getPostData(slug) {
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !post) return null;

    // Convert markdown to html
    const processedContent = await remark()
        .use(html)
        .process(post.content || '');
    const contentHtml = processedContent.toString();

    return {
        id: slug,
        contentHtml,
        ...post
    };
}
