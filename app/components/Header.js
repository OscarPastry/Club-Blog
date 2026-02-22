import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.meta}>
                <span>Week. 4</span>
                <span>Weekly Edition</span>
                <span>Week's Theme: Gacha Culture</span>
            </div>
            <h1 className={styles.title}>
                Wabi Sabi Weekly
            </h1>
            <div className={styles.subline}>
                <span>Japanese Club Official Blog</span>
                <span>•</span>
                <span>日本語クラブ</span>
            </div>
        </header>
    );
}
