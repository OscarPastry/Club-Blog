import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/auth';

function cleanSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(request) {
    // Auth check
    const auth = verifyAuthToken(request);
    if (!auth.valid) {
        return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, author, summary, content } = body;

        // Input validation
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
        }
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
        }
        if (!date || typeof date !== 'string') {
            return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
        }
        if (!author || typeof author !== 'string') {
            return NextResponse.json({ success: false, error: 'Author is required' }, { status: 400 });
        }
        if (title.length > 500) {
            return NextResponse.json({ success: false, error: 'Title too long (max 500 chars)' }, { status: 400 });
        }
        if (content.length > 100000) {
            return NextResponse.json({ success: false, error: 'Content too long (max 100k chars)' }, { status: 400 });
        }

        // Generate slug
        const slugBase = cleanSlug(title);
        const slug = `${slugBase}-${Date.now()}`; // Ensure uniqueness

        const { error } = await supabase
            .from('posts')
            .insert({
                slug,
                title: title.trim(),
                date,
                author: author.trim(),
                summary: summary ? summary.trim() : '',
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

