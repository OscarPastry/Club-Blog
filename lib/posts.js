import { supabase } from './supabase';
import { remark } from 'remark';
import html from 'remark-html';
import sanitizeHtml from 'sanitize-html';

// Allow safe HTML tags but block script injection, iframes, event handlers
const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'figure', 'figcaption', 'picture', 'source',
        'details', 'summary', 'mark', 'del', 'ins',
        'sub', 'sup', 'kbd', 'var', 'samp',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'caption', 'colgroup', 'col',
        'section', 'article', 'aside', 'nav', 'header', 'footer',
        'span', 'div', 'br', 'hr',
    ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'style'],
        a: ['href', 'title', 'target', 'rel'],
        td: ['align', 'valign', 'colspan', 'rowspan'],
        th: ['align', 'valign', 'colspan', 'rowspan'],
        '*': ['class', 'id', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
};

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

    // Convert markdown to html (allow raw HTML through remark)
    const processedContent = await remark()
        .use(html, { sanitize: false })
        .process(post.content || '');

    // Sanitize output to block XSS while preserving safe HTML
    const contentHtml = sanitizeHtml(processedContent.toString(), sanitizeOptions);

    return {
        id: slug,
        contentHtml,
        ...post
    };
}
