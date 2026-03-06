import { NextResponse } from 'next/server';
import { getPostEngagement, incrementView, incrementLike, addComment, deleteComment } from '@/lib/engagement';
import { verifyAuthToken } from '@/lib/auth';

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
            if (!payload || !payload.text || typeof payload.text !== 'string') {
                return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
            }
            if (payload.text.trim().length === 0) {
                return NextResponse.json({ error: 'Comment text cannot be empty' }, { status: 400 });
            }
            if (payload.text.length > 2000) {
                return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 });
            }
            if (payload.author && (typeof payload.author !== 'string' || payload.author.length > 100)) {
                return NextResponse.json({ error: 'Author name too long (max 100 chars)' }, { status: 400 });
            }
            result = await addComment(slug, {
                text: payload.text.trim(),
                author: payload.author ? payload.author.trim() : 'Anonymous'
            });
            break;
        case 'delete-comment': {
            // Auth required for deleting comments
            const auth = verifyAuthToken(request);
            if (!auth.valid) {
                return NextResponse.json({ error: auth.error }, { status: 401 });
            }
            if (!payload || !payload.commentId) {
                return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
            }
            result = await deleteComment(slug, payload.commentId);
            break;
        }
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
}

