import Header from "./components/Header";
import HamburgerMenu from "./components/HamburgerMenu";
import { getSortedPostsData } from "@/lib/posts";
import styles from "./Home.module.css";

export const revalidate = 0;

export default async function Home() {
  const posts = await getSortedPostsData();

  if (!posts || posts.length === 0) {
    return (
      <main className={styles.container}>
        <Header />
        <p style={{ textAlign: 'center' }}>No news today.</p>
      </main>
    );
  }

  const latestPost = posts[0];
  const sidePosts = posts.slice(1);

  return (
    <main className={styles.container}>
      <HamburgerMenu posts={posts} />
      <Header />

      <div className={styles.grid}>
        {/* Main Lead Article */}
        <article className={styles.leadArticle}>
          <span className={styles.leadMeta}>{latestPost.date} | {latestPost.author}</span>
          <h2 className={styles.leadTitle}>
            <a href={`/posts/${latestPost.id}`}>{latestPost.title}</a>
          </h2>
          <p className={styles.leadSummary}>
            {latestPost.summary}
          </p>
          <div className={styles.readMore}>
            <a href={`/posts/${latestPost.id}`}>Continue Reading →</a>
          </div>
        </article>

        {/* Sidebar / Smaller Articles */}
        <aside className={styles.sidebar}>
          {sidePosts.map(post => (
            <article key={post.id} className={styles.sideArticle}>
              <h3 className={styles.sideTitle}>
                <a href={`/posts/${post.id}`}>{post.title}</a>
              </h3>
              <p className={styles.sideSummary}>{post.summary}</p>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}
