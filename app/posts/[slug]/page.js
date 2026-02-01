import { getPostData, getAllPostIds, getSortedPostsData } from '@/lib/posts';
import Header from "../../components/Header";
import HamburgerMenu from "../../components/HamburgerMenu";
import Engagement from "../../components/Engagement"; // Import Engagement
import Link from 'next/link';

export async function generateStaticParams() {
    return getAllPostIds();
}

export default async function Post({ params }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    const allPosts = await getSortedPostsData();

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <HamburgerMenu posts={allPosts} />
            <Header />

            <div style={{ padding: '2rem', border: '1px solid var(--foreground)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
                <p style={{ textAlign: 'center', marginBottom: '1rem', fontStyle: 'italic' }}>
                    {postData.date} • {postData.author}
                </p>

                <h1 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '2rem', lineHeight: '1.1' }}>
                    {postData.title}
                </h1>

                {/* Markdown Content */}
                <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
                    style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                />

                {/* Engagement Section */}
                <Engagement slug={slug} />

                <div style={{ marginTop: '3rem', borderTop: 'double 4px var(--foreground)', paddingTop: '1rem', textAlign: 'center' }}>
                    <Link href="/">← Return to Front Page</Link>
                </div>
            </div>
        </main>
    );
}
