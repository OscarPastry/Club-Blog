const url = 'https://oeybvatgcnoygcgluyhb.supabase.co/rest/v1/posts';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9leWJ2YXRnY25veWdjZ2x1eWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Mjc3MDQsImV4cCI6MjA4NDIwMzcwNH0.uRzxob05RHsKZZS6T5-eFiWJOhszoCd1bYARxdTz-lw';

async function run() {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            slug: 'test-slug-123456',
            title: 'Test',
            date: '2025-01-01',
            author: 'Me',
            summary: 'clothing, vintage aesthetics, and femininity laced with intellectuality. In academic terms, Olive helped construct an interior identity in young girls. It normalized the idea that fashion could be a personal way for world-building rather than a trend to follow or copy. This psychological groundwork later made Harajuku possible.',
            content: 'Hello world',
            views: 0,
            likes: 0
        })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
}
run();
