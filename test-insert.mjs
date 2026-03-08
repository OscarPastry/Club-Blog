import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing insert...");
    const title = "Layered Like Lace: How Harajuku Built a World of Its Own";
    function cleanSlug(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    const slug = `${cleanSlug(title)}-${Date.now()}`;
    const { data, error } = await supabase
        .from('posts')
        .insert({
            slug,
            title,
            date: '2026-03-08',
            author: 'Krithika',
            summary: 'clothing, vintage aesthetics, and femininity laced with intellectuality. In academic terms, Olive helped construct an interior identity in young girls. It normalized the idea that fashion could be a personal way for world-building rather than a trend to follow or copy. This psychological groundwork later made Harajuku possible.',
            content: 'test content',
            views: 0,
            likes: 0
        }).select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
        await supabase.from('posts').delete().eq('slug', slug);
        console.log('Cleanup complete');
    }
}
test();
