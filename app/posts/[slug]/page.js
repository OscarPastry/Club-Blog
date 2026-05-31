import { getPostData, getAllPostIds, getSortedPostsData } from "@/lib/posts";
import Header from "../../components/Header";
import HamburgerMenu from "../../components/HamburgerMenu";
import Engagement from "../../components/Engagement";
import ReadingProgress from "../../components/ReadingProgress";
import Link from "next/link";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return getAllPostIds();
}

export const revalidate = 0;

export default async function Post({ params }) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  const allPosts = await getSortedPostsData();

  return (
    <main className={styles.container}>
      <ReadingProgress />
      <HamburgerMenu posts={allPosts} />
      <Header />

      <div className={styles.articleLayout}>
        {/* Main article column */}
        <article className={styles.articleMain}>
          <div className={styles.articleMeta}>
            <span>[ {postData.date} ]</span>
            <span>By {postData.author}</span>
          </div>

          <h1
            className={styles.articleTitle}
            dangerouslySetInnerHTML={{ __html: postData.title }}
          />

          <div
            className={`${styles.articleBody} markdown-content`}
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />

          <Engagement slug={slug} />

          <footer className={styles.articleFooter}>
            <span>Wabi Sabi Weekly</span>
            <span>© 2024 Wabi Sabi Weekly • Japanese Club Official Blog</span>
          </footer>

          <Link href="/" className={styles.returnLink}>
            ← Return to Front Page
          </Link>
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>In This Issue</div>
          <p className={styles.sidebarNote}>
            {postData.summary
              ? postData.summary.replace(/<[^>]*>/g, "").slice(0, 160) + "…"
              : "Continue reading for the full dispatch."}
          </p>
        </aside>
      </div>
    </main>
  );
}
