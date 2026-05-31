"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./HamburgerMenu.module.css";

export default function HamburgerMenu({ posts = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={styles.menuContainer}>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <Link
            href="/"
            className={styles.homeLink}
            aria-label="Go Home"
            onClick={() => setIsOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            Close
          </button>
        </div>

        <div className={styles.archiveLabel}>Archives</div>

        <ul className={styles.archiveList}>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`} onClick={() => setIsOpen(false)}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    opacity: 0.6,
                    display: "block",
                  }}
                >
                  {post.date}
                </span>
                <span dangerouslySetInnerHTML={{ __html: post.title }} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
