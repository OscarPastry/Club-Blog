import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', id)
        .single();

    if (error) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
}


export async function PUT(request) {
    const body = await request.json();
    const { id, title, date, author, summary, content } = body;

    const { error } = await supabase
        .from('posts')
        .update({ title, date, author, summary, content })
        .eq('slug', id);

    if (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Post updated' });
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('slug', id);

    if (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted' });
}
