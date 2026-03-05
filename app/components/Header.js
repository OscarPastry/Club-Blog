import styles from './Header.module.css';
import { siteConfig } from '@/lib/siteConfig';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.meta}>
                <span>Week. {siteConfig.header.week}</span>
                <span>{siteConfig.header.edition}</span>
                <span>Week&apos;s Theme: {siteConfig.header.theme}</span>
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
