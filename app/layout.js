import { Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-jp",
  preload: false, // Sometimes needed for JP fonts if subset issues arise, but let's try default
});

export const metadata = {
  title: "Club Blog - Morning Edition",
  description: "A blog for the Japanese Club",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${notoJP.variable}`}>
        {children}
      </body>
    </html>
  );
}
