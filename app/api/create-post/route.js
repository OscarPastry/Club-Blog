import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function cleanSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, date, author, summary, content } = body;

        // Generate slug
        const slugBase = cleanSlug(title);
        const slug = `${slugBase}-${Date.now()}`; // Ensure uniqueness

        const { error } = await supabase
            .from('posts')
            .insert({
                slug,
                title,
                date,
                author,
                summary,
                content,
                views: 0,
                likes: 0
            });

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Post created', slug });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Error saving post' }, { status: 500 });
    }
}
