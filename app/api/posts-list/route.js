import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/posts';

// Re-use the library function which now points to Supabase
export async function GET() {
    const posts = await getSortedPostsData();
    return NextResponse.json({ posts });
}
