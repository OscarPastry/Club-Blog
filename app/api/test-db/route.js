import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) {
            return NextResponse.json({ error: "Missing Supabase URL" });
        }

        const { data, error } = await supabase.from('posts').select('*').limit(1);
        if (error) throw error;

        return NextResponse.json({ success: true, count: data.length });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message || e.toString() });
    }
}
