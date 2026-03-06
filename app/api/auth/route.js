import { NextResponse } from 'next/server';
import { generateAuthToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password || typeof password !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Password is required' },
                { status: 400 }
            );
        }

        const editorPassword = process.env.EDITOR_PASSWORD;

        if (!editorPassword) {
            console.error('EDITOR_PASSWORD environment variable is not set');
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (password !== editorPassword) {
            return NextResponse.json(
                { success: false, error: 'Incorrect password' },
                { status: 401 }
            );
        }

        const token = generateAuthToken();

        return NextResponse.json({ success: true, token });
    } catch (e) {
        console.error('Auth error:', e);
        return NextResponse.json(
            { success: false, error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
