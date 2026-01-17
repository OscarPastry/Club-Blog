import { NextResponse } from 'next/server';
import { getPostEngagement, incrementView, incrementLike, addComment, deleteComment } from '@/lib/engagement';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const data = await getPostEngagement(slug);
    return NextResponse.json(data);
}

export async function POST(request) {
    const body = await request.json();
    const { slug, action, payload } = body;

    if (!slug || !action) {
        return NextResponse.json({ error: 'Slug and action are required' }, { status: 400 });
    }

    let result;

    switch (action) {
        case 'view':
            result = await incrementView(slug);
            break;
        case 'like':
            result = await incrementLike(slug);
            break;
        case 'comment':
            if (!payload || !payload.text) {
                return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
            }
            result = await addComment(slug, payload);
            break;
        case 'delete-comment':
            if (!payload || !payload.commentId) {
                return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
            }
            result = await deleteComment(slug, payload.commentId);
            break;
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
}
