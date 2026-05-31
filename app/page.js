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
        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--secondary)",
          }}
        >
          No dispatches today.
        </p>
      </main>
    );
  }

  const latestPost = posts[0];
  const sidePosts = posts.slice(1, 3);

  const truncateSummary = (text, wordLimit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + " …";
  };

  return (
    <main className={styles.container}>
      <HamburgerMenu posts={posts} />
      <Header />

      <div className={styles.grid}>
        {/* Lead Article */}
        <article className={styles.leadArticle}>
          <span className={styles.leadMeta}>
            [ {latestPost.date} ] &nbsp; By {latestPost.author}
          </span>
          <h2 className={styles.leadTitle}>
            <a
              href={`/posts/${latestPost.id}`}
              dangerouslySetInnerHTML={{ __html: latestPost.title }}
            />
          </h2>
          <p
            className={styles.leadSummary}
            dangerouslySetInnerHTML={{ __html: latestPost.summary }}
          />
          <div className={styles.readMore}>
            <a href={`/posts/${latestPost.id}`}>Continue Reading →</a>
          </div>
        </article>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {sidePosts.map((post) => (
            <article key={post.id} className={styles.sideArticle}>
              <h3 className={styles.sideTitle}>
                <a
                  href={`/posts/${post.id}`}
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
              </h3>
              <p
                className={styles.sideSummary}
                dangerouslySetInnerHTML={{
                  __html: truncateSummary(post.summary, 80),
                }}
              />
            </article>
          ))}
        </aside>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Wabi Sabi Weekly</span>
        <nav className={styles.footerLinks}>
          <a href="#">About</a>
          <a href="#">Membership</a>
          <a href="#">Ethics Policy</a>
          <a href="#">Contact</a>
        </nav>
        <span>© 2024 Wabi Sabi Weekly • Japanese Club Official Blog</span>
      </footer>
    </main>
  );
}
