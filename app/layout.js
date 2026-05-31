import {
  Playfair_Display,
  Libre_Caslon_Text,
  JetBrains_Mono,
  Noto_Serif_JP,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const libreCaslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-caslon",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

const notoJP = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-jp",
  preload: false,
});

export const metadata = {
  title: "Wabi Sabi Weekly - Japanese Club VIT Chennai",
  description: "A blog for the Japanese Club at VIT Chennai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${libreCaslon.variable} ${jetbrainsMono.variable} ${notoJP.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
